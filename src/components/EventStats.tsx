import '../styles/components/EventStats.css'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { Event, WalletTicket } from '../../types/supabaseplain';
import { ActivityIndicator } from './ActivityIndicator';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

interface BoxProps {
  number: number | null;
  subtitle: string;
  onClick: () => void;
  styles: React.CSSProperties;
}

type DataStructure = {
  key: string;
  subtitle: string;
  data: Partial<WalletTicket>[] | number | null;
}[];

const Box: React.FC<BoxProps> = ({ number, subtitle, onClick, styles }) => (
  <div className="box" onClick={onClick} style={styles}>
    <div className="subtitle">{subtitle}</div>
    <div className="number">{ number ? number : <ActivityIndicator/> }</div>
  </div>
);

export default function EventStats({ event }: { event: Event | undefined }) {
  const [combinedStats, setCombinedStats] = useState<{ name: string, sold: number, used: number }[]>([]);
  const [selectedStats, setSelectedStats] = useState<number[]>([0, 1]);
  const [stats, setStats] = useState<DataStructure>([
    { key: 'sold', subtitle: 'Tickets venuts', data: null },
    { key: 'used', subtitle: 'Tickets utilitzats', data: null },
    { key: 'following', subtitle: 'Usuaris seguint l\'esdeveniment', data: null },
  ]);

  useEffect(() => { //TODO PAU this is running twice, fix it
    if (!event) return;
    let unmounted = false;
    supabase.from('wallet_tickets').select('order_id, used_at, created_at').eq('event_id', event.id) //TODO PAU make this a rpc function
    .then(({ data: wallet_tickets, error }) => {
      if (unmounted || error) return;
      setStats(prevStats => prevStats.map(stat => stat.key === 'used' ? { ...stat, data: wallet_tickets?.filter(ticket => ticket.used_at !== null) ?? [] } : stat));

      supabase.from('redsys_orders').select('order_id').eq('event_id', event.id).eq('order_status', 'PAYMENT_SUCCEDED') //TODO PAU make this a rpc function
      .then(({ data: orders, error }) => {
        if (unmounted || error) return;
        const validWalletTickets = wallet_tickets?.filter(ticket => orders.some(order => order.order_id === ticket.order_id));
        setStats(prevStats => prevStats.map(stat => stat.key === 'sold' ? { ...stat, data: validWalletTickets ?? [] } : stat));
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

  useEffect(() => {
    if (stats.some(stat => stat.data === null)) {
      return;
    }
    const groupByTimeFrame = (tickets: WalletTicket[], key: 'created_at' | 'used_at', timeFrame: number) => {
      return tickets.reduce((acc, ticket) => {
        if (ticket[key] != null) {
          const date = new Date(ticket[key]);
          date.setMinutes(Math.floor(date.getMinutes() / timeFrame) * timeFrame);
          date.setSeconds(0);
          date.setMilliseconds(0);
          const dateKey = date.toISOString();
          acc[dateKey] = (acc[dateKey] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
    };

    const soldData = stats.find(stat => stat.key === 'sold')?.data;
    const startDate = new Date(Math.min(...(Array.isArray(soldData) ? soldData : [])?.map(ticket => new Date(ticket.created_at ?? '').getTime()) ?? []));
    const endDate = new Date();

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffHours = diffTime / (1000 * 60 * 60); // convert difference to hours

    
    let timeFrame;
    if (diffHours < 0.5) {
      timeFrame = 1; // 5 minutes
    } else if (diffHours < 1) {
      timeFrame = 5; // 5 minutes
    } else if (diffHours < 3) {
      timeFrame = 15; // 15 minutes
    } else if (diffHours < 10) {
      timeFrame = 30; // 30 minutes
    } else if (diffHours < 72) {
      timeFrame = 60; // 1 hour
    } else if (diffHours < 168) {
      timeFrame = 300; // 5 hours
    } else if (diffHours < 720) {
      timeFrame = 1440; // 1 day
    } else {
      timeFrame = 10080; // 1 week
    }

    const soldStats = groupByTimeFrame(stats.find(stat => stat.key === 'sold')?.data as WalletTicket[], 'created_at', timeFrame);
    const usedStats = groupByTimeFrame(stats.find(stat => stat.key === 'used')?.data as WalletTicket[], 'used_at', timeFrame);

    const combinedStats = [];
    let totalSold = 0;
    let totalUsed = 0;
    let prevDate: Date | undefined;

    for (let date = startDate; date <= endDate; date.setMinutes(date.getMinutes() + timeFrame)) {
      const dateKey = new Date(date);
      dateKey.setMinutes(Math.floor(date.getMinutes() / timeFrame) * timeFrame);
      dateKey.setSeconds(0);
      dateKey.setMilliseconds(0);
      const dateKeyString = dateKey.toISOString();
      const dateKeyStringFormatted = formatDate(dateKey, prevDate);
      prevDate = dateKey;

      const sold = soldStats[dateKeyString] || 0;
      totalSold += sold;

      const used = usedStats[dateKeyString] || 0;
      totalUsed += used;

      combinedStats.push({
        name: dateKeyString,
        formattedName: dateKeyStringFormatted,
        sold: totalSold,
        used: totalUsed,
      });
    }

    setCombinedStats(combinedStats);
  }, [stats]);

  const formatDate = (date: Date, prevDate?: Date) => {
    let options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };
    if (!prevDate || prevDate.getDate() !== date.getDate() || prevDate.getMonth() !== date.getMonth()) {
      options = {
        ...options,
        day: '2-digit',
        month: '2-digit'
      };
    }
    if (!prevDate || prevDate.getFullYear() !== date.getFullYear()) {
      options = {
        ...options,
        year: 'numeric'
      };
    }
    return new Intl.DateTimeFormat(undefined, options).format(date);
  }

  const handleSelectedStat = (index: number) => {
    if (selectedStats.includes(index)) {
      setSelectedStats(selectedStats.filter(boxIndex => boxIndex !== index));
    } else {
      setSelectedStats([...selectedStats, index]);
    }
  };

  return (
    <div className="eventStatsContainer">
      <div className="boxContainer">
        { !stats || !stats?.length ? 
          <ActivityIndicator />
        : <>
          {stats.map(({ subtitle, data }, index) => (
            <Box number={typeof data === 'number' ? data : data?.length ?? 0} subtitle={subtitle} onClick={() => handleSelectedStat(index)} key={index} styles={{ backgroundColor: selectedStats.includes(index) ? 'rgba(140, 144, 163, 0.18)' : '' }} />
          ))}
        </> }
      </div>
      <div className="chartContainer">
        { combinedStats.length ? <>
          <h2 className="chartTitle">Stats</h2>
          <AreaChart width={730} height={500} data={combinedStats}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="formattedName" angle={-45} textAnchor="end" tick={{ fontSize: 13 }} tickMargin={5} height={100} />
            <YAxis tickMargin={3} width={80} />
            <CartesianGrid strokeDasharray="3 3" opacity={.5} />
            <Tooltip labelStyle={{ color: 'black' }} />
            <Area type="monotone" dataKey={selectedStats.includes(0) ? 'sold' : ''} stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
            <Area type="monotone" dataKey={selectedStats.includes(1) ? 'used' : ''} stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
          </AreaChart>
        </> : null }
      </div>
    </div>
  );
}
