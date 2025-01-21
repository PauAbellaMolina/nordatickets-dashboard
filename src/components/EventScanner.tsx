import { useEffect, useState } from 'react';
import '../styles/components/EventScanner.css';
import { useLanguageProvider } from '../utils/LanguageProvider';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { ActivityIndicator } from './ActivityIndicator';
import { supabase } from '../../supabase';
import { WalletTicket } from '../../types/supabaseplain';
import { User } from '@supabase/supabase-js';

export default function EventScanner({ event_id }: { event_id: number | undefined }) {
  const { i18n } = useLanguageProvider();

  const [scannedId, setScannedId] = useState<string | null>(null);
  const [walletTicket, setWalletTicket] = useState<WalletTicket | null>(null);
  const [ticketUsedAt, setTicketUsedAt] = useState<string | null>(null);
  const [ticketUsedTimeAgo, setTicketUsedTimeAgo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!scannedId) return;
    //scannedId structure -> orderId + '_' + walletTicket.user_id + '_' + walletTicket.id + '_' + walletTicket.event_tickets_id
    const orderId = scannedId.split('_')[0];
    const userId = scannedId.split('_')[1];
    const walletTicketId = scannedId.split('_')[2];
    const eventTicketsId = scannedId.split('_')[3];

    supabase.from('wallet_tickets').select().eq('id', walletTicketId).eq('user_id', userId).eq('order_id', orderId).eq('event_tickets_id', eventTicketsId).single()
    .then(({ data: wallet_ticket, error }) => {
      if (error) return; //TODO PAU handle error
      console.log("wallet_ticket", wallet_ticket);
      setWalletTicket(wallet_ticket);
      setTicketUsedAt(wallet_ticket.used_at);
    });
  }, [scannedId]);

  useEffect(() => {
    if (!ticketUsedAt) return;
    calculateTimeAgo();
    const i = setInterval(calculateTimeAgo, 1000);

    return () => clearInterval(i);
  }, [ticketUsedAt]);

  const calculateTimeAgo = () => {
    const usedAt = new Date(new Date(ticketUsedAt).setMilliseconds(0));
    const now = new Date();
    const diff = now.getTime() - usedAt.getTime();
    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    let timeAgo = '';
    if (days > 0) {
      timeAgo += `${days} ${i18n?.t('days')} `;
    }
    if (hours > 0) {
      timeAgo += `${hours} ${i18n?.t('hours')} `;
    }
    if (minutes > 0) {
      timeAgo += `${minutes} ${i18n?.t('minutes')} `;
    }
    if (seconds >= 0) {
      timeAgo += `${seconds} ${i18n?.t('seconds')}`;
    }

    setTicketUsedTimeAgo(timeAgo.trim());
  };
  
  const handleScan = (data: IDetectedBarcode[]) => {
    console.log("handleScann", data);
    if (data) { //TODO PAU handle error
      setScannedId(data[0].rawValue);
      // setScannedId('1008yb1Otpd1_0528d00f-055a-4fde-8801-04510a3575c1_103_10'); //JUST FOR DEVING
    }
  };

  const handleError = (err: any) => {
    console.error(err); //TODO PAU handle error
  };

  const deactivateWalletTicket = () => {
    console.log("deactivateWalletTicket");
    if (!walletTicket?.user_id) return;
    supabase.rpc('update_wallet_tickets_used_at', { req_user_id: walletTicket.user_id, wallet_tickets_id: walletTicket.id, addon_id: null })
    .then(({ data: usedAt }) => {
      if (!usedAt) return;
      setTicketUsedAt(usedAt);
      setLoading(false);
    });
  };

  return (
    <div className="scannerContainer">
      <Scanner
        formats={['qr_code']}
        allowMultiple={false}
        onScan={handleScan}
        onError={handleError}
        styles={{
          finderBorder: 0,
          container: {
            width: '90%',
            height: '90%'
          },
          video: {
            borderRadius: '10px'
          }
        }}
      />
      {scannedId != null ?
        <div className="scannedContainer">
          <h2>Ticket escanejat!</h2>
          { !walletTicket ?
            <ActivityIndicator />
          :
            <div className="walletTicketInfoContainer">
              <div>
                <p>{walletTicket.event_tickets_name}</p>
                <p>Ticket Nº: {walletTicket.id}</p>
                <p>Ordre: {walletTicket.order_id}</p>
                <p>Preu: {walletTicket.price/100}€</p>
                <p>Estat: {ticketUsedAt ? 'DESACTIVAT fa ' + ticketUsedTimeAgo : 'ACTIU'}</p>
              </div>
              { !ticketUsedAt ?
                <button
                  disabled={false}
                  className="button"
                  onClick={deactivateWalletTicket}
                >
                  <span className="buttonText">Desactivar</span>
                </button>
              : null }
            </div>
          }
        </div>
      :
        <div className="scanningContainer">
          <h2>{ i18n?.t('scanningTicket') }</h2>
          <div className="loaderDots"></div>
        </div>
      }
    </div>
  );
}
