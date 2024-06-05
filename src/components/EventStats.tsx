import '../styles/components/EventStats.css'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { Event } from '../../types/supabaseplain';
import { ActivityIndicator } from './ActivityIndicator';

interface BoxProps {
  number: number | null;
  subtitle: string;
  onClick: () => void;
}

type DataStructure = {
  key: string;
  subtitle: string;
  data: number | null;
}[];

const Box: React.FC<BoxProps> = ({ number, subtitle, onClick }) => (
  <div className="box" onClick={onClick}>
    <div className="subtitle">{subtitle}</div>
    <div className="number">{ number ? number : <ActivityIndicator/> }</div>
  </div>
);

export default function EventStats({ event }: { event: Event | undefined }) {
  const [selectedBox, setSelectedBox] = useState<number | null>(1);
  const [stats, setStats] = useState<DataStructure>([
    { key: 'sold', subtitle: 'Tickets venuts', data: null },
    { key: 'used', subtitle: 'Tickets utilitzats', data: null },
    { key: 'following', subtitle: 'Usuaris seguint l\'esdeveniment', data: null },
  ]);

  useEffect(() => { //TODO PAU this is running twice, fix it
    if (!event) return;
    let unmounted = false;
    supabase.from('wallet_tickets').select('order_id, used_at').eq('event_id', event.id)
    .then(({ data: wallet_tickets, error }) => {
      if (unmounted || error) return;
      setStats(prevStats => prevStats.map(stat => stat.key === 'used' ? { ...stat, data: wallet_tickets?.reduce((count, ticket) => ticket.used_at ? count + 1 : count, 0) ?? 0 } : stat));

      supabase.from('redsys_orders').select('order_id').eq('event_id', event.id).eq('order_status', 'PAYMENT_SUCCEDED')
      .then(({ data: orders, error }) => {
        if (unmounted || error) return;
        const validWalletTickets = wallet_tickets?.filter(ticket => orders.some(order => order.order_id === ticket.order_id));
        setStats(prevStats => prevStats.map(stat => stat.key === 'sold' ? { ...stat, data: validWalletTickets?.length ?? 0 } : stat));
      });
    });

    supabase.rpc('count_users_following_event', { event_id: event.id })
    .then(({ data: count, error }) => {
      if (unmounted || error) return;
      setStats(prevStats => prevStats.map(stat => stat.key === 'following' ? { ...stat, data: count ?? 0 } : stat));
    });

    return () => {
      unmounted = true;
    };
  }, [event]);

  return (
    <div className="eventStatsContainer">
      <div className="boxContainer">
      { !stats || !stats?.length ? 
        <ActivityIndicator />
      : <>
        {stats.map(({ subtitle, data }, index) => (
          <Box number={data} subtitle={subtitle} onClick={() => setSelectedBox(index)} key={index} />
        ))}
      </> }
      </div>
      { selectedBox !== null ? 
        <div className="chartContainer">Chart for box {selectedBox}</div>
      : null }
    </div>
  );
}
