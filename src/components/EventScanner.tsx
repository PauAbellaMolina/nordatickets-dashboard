import { useEffect, useState } from 'react';
import '../styles/components/EventScanner.css';
import { useLanguageProvider } from '../utils/LanguageProvider';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { ActivityIndicator } from './ActivityIndicator';
import { supabase } from '../../supabase';
import { WalletTicket } from '../../types/supabaseplain';
import Camera from '../assets/camera.svg';

export default function EventScanner({ event_id }: { event_id: number | undefined }) {
  const { i18n } = useLanguageProvider();

  const [scannedId, setScannedId] = useState<string | null>(null);
  const [walletTicket, setWalletTicket] = useState<WalletTicket | null>(null);
  const [ticketUsedAt, setTicketUsedAt] = useState<string | null>(null);
  const [ticketUsedTimeAgo, setTicketUsedTimeAgo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); //TODO PAU use spinners while loading

  useEffect(() => {
    if (!scannedId) return;
    //scannedId structure -> orderId + '_' + walletTicket.user_id + '_' + walletTicket.id + '_' + walletTicket.event_tickets_id
    const orderId = scannedId.split('_')[0];
    const userId = scannedId.split('_')[1];
    const walletTicketId = scannedId.split('_')[2];
    const eventTicketsId = scannedId.split('_')[3];

    supabase.from('wallet_tickets').select().eq('id', walletTicketId).eq('user_id', userId).eq('order_id', orderId).eq('event_tickets_id', eventTicketsId).single()
    .then(({ data: wallet_ticket, error }) => {
      if (error || event_id != wallet_ticket.event_id) {
        onNewScan(); //TODO PAU inform about error
        return;
      };
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
    if (!data) {
      onNewScan();
      return;
    }
    setScannedId(data[0].rawValue);
  };

  const handleError = (err: any) => {
    console.error(err); //TODO PAU handle error
    onNewScan();
  };

  const deactivateWalletTicket = () => {
    if (!walletTicket?.user_id) return;
    setLoading(true);
    supabase.rpc('update_wallet_tickets_used_at', { req_user_id: walletTicket.user_id, wallet_tickets_id: walletTicket.id, addon_id: null })
    .then(({ data: usedAt }) => {
      if (!usedAt) return;
      setTicketUsedAt(usedAt);
      setLoading(false);
    });
  };

  const reactivateWalletTicket = () => {
    if (!walletTicket?.user_id) return;
    setLoading(true);
    supabase.rpc('remove_wallet_tickets_used_at', { req_user_id: walletTicket.user_id, wallet_tickets_id: walletTicket.id })
    .then(({ data: removed }) => {
      if (!removed) return;
      setTicketUsedAt(null);
      setLoading(false);
    });
  };

  const onNewScan = () => {
    setScannedId(null);
    setWalletTicket(null);
    setTicketUsedAt(null);
    setTicketUsedTimeAgo(null);
  };

  return (
    <div className="scannerContainer">
      {scannedId != null ? <>
        <div className="scannedTicketContainer" style={{ backgroundColor: ticketUsedAt ? '#ff3737' : '#3fde7a' }}>
          { !walletTicket ?
            <ActivityIndicator />
          : 
            <div className="scannedTicketInfoContainer">
              <h2>{walletTicket.event_tickets_name}</h2>
              <div className="scannedTicketInfo">
                <p>Ticket nº: {walletTicket.id}</p>
                <p>Order ID: {walletTicket.order_id}</p>
                <p>{ i18n?.t('price') }: {walletTicket.price/100}€</p>
              </div>
            </div>
          }
        </div>
        <div className="scannedActionsContainer">
          { walletTicket ? <>
            <button
              className="button newScanButton"
              onClick={onNewScan}
            >
              <img src={Camera} alt="camera" className="icon" />
              <span className="buttonText">{ i18n?.t('newScan') }</span>
            </button>
            <div className="scannedTicketStatusContainer">
              <div className="scannedTicketStatus">
                <h2>{ticketUsedAt ? i18n?.t('deactivated') : i18n?.t('active')}</h2>
                { ticketUsedAt ?
                  <p>{ticketUsedTimeAgo}</p>
                : null }
              </div>
              <button
                disabled={loading || !!ticketUsedAt}
                className="button"
                onClick={deactivateWalletTicket}
              >
                <span className="buttonText">{ i18n?.t('deactivate') }</span>
              </button>
              <button
                disabled={loading || !ticketUsedAt}
                className="button reactivateButton"
                onClick={reactivateWalletTicket}
              >
                <span className="buttonText">{ i18n?.t('reactivate') }</span>
              </button>
            </div>
          </> : null }
        </div>
      </> : <>
        <Scanner
          formats={['qr_code']}
          allowMultiple={false}
          onScan={handleScan}
          onError={handleError}
          styles={{
            finderBorder: 0,
            container: {
              width: '90%',
              height: '90%',
              maxWidth: '400px',
              marginTop: '35px',
              marginBottom: '20px'
            },
            video: {
              borderRadius: '10px'
            }
          }}
        />
        <div className="scanningContainer">
          <h2>{ i18n?.t('scanningTicket') }</h2>
          <div className="loaderDots"></div>
        </div>
      </> }
    </div>
  );
}
