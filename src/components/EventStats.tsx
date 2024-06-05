import '../styles/components/EventStats.css'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { Event, WalletTicket } from '../../types/supabaseplain';
import { ActivityIndicator } from './ActivityIndicator';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

interface BoxProps {
  number: number | null;
  subtitle: string;
  selectable: boolean;
  onClick: () => void;
  styles: React.CSSProperties;
}

type DataStructure = {
  key: string;
  subtitle: string;
  data: Partial<WalletTicket>[] | number | null;
}[];

const Box: React.FC<BoxProps> = ({ number, subtitle, selectable, onClick, styles }) => (
  <div className={"box " + (!selectable ? 'noHover' : '')} onClick={selectable ? onClick : undefined} style={styles}>
    <div className="subtitle">{subtitle}</div>
    <div className="number">{ number != null ? number : <ActivityIndicator/> }</div>
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

  const getStats = async (eventId: number, unmounted: boolean) => {
    const { data, error } = await supabase.functions.invoke('get-sold-tickets-stat', {
      body: { eventId: eventId },
    });
    if (error || unmounted) return;

    setStats(data[0]);
    setCombinedStats(data[1]);
  };

  useEffect(() => {
    if (!event) return;
    let unmounted = false;

    getStats(event.id, unmounted);

    return () => {
      unmounted = true;
    };
  }, [event]);

  const handleSelectedStat = (index: number) => {
    if (selectedStats.includes(index)) {
      setSelectedStats(selectedStats.filter(boxIndex => boxIndex !== index));
    } else {
      setSelectedStats([...selectedStats, index]);
    }
  };

  const isSelectable = (key: string) => {
    switch (key) {
      case 'sold':
        return true;
      case 'used':
        return true;
      case 'following':
        return false;
      default:
        return false;
    }
  };

  const getBoxSelectedBackgroundColor = (key: string) => {
    switch (key) {
      case 'sold':
        return 'rgba(136, 132, 216, 0.18)';
      case 'used':
        return 'rgba(130, 202, 157, 0.18)';
      default:
        return 'rgba(140, 144, 163, 0.18)';
    }
  };

  const getBoxSelectedColor = (key: string) => {
    switch (key) {
      case 'sold':
        return 'rgba(136, 132, 216, 1)';
      case 'used':
        return 'rgba(130, 202, 157, 1)';
      default:
        return 'fieldtext';
    }
  };

  return (
    <div className="eventStatsContainer">
      <div className="boxContainer">
        { !stats || !stats?.length ? 
          <ActivityIndicator />
        : <>
          {stats.map(({ key, subtitle, data }, index) => (
            <Box number={typeof data === 'number' ? data : 0} subtitle={subtitle} selectable={isSelectable(key)} onClick={() => handleSelectedStat(index)} key={index} styles={{ backgroundColor: selectedStats.includes(index) ? getBoxSelectedBackgroundColor(key) : '', borderColor: selectedStats.includes(index) ? getBoxSelectedColor(key) : '#8C90A3' }} />
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
