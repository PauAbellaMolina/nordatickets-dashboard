import '../styles/components/EventStats.css';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Event } from '../../types/supabaseplain';
import { ActivityIndicator } from './ActivityIndicator';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import useWindowDimensions from '../utils/useWindowDimensions';
import { useLanguageProvider } from '../utils/LanguageProvider';
import { I18n } from 'i18n-js';

interface BoxProps {
  number: number | null;
  i18n: I18n | null;
  subtitle: string;
  onClick: () => void;
  styles: React.CSSProperties;
}

type DataStructure = {
  key: string;
  subtitle: string;
  data: number | null;
}[];

const Box: React.FC<BoxProps> = ({ number, i18n, subtitle, onClick, styles }) => (
  <div className={"box"} onClick={onClick} style={styles}>
    <div className="subtitle">{ i18n?.t(subtitle) }</div>
    <div className="number">{ number != null ? number : <ActivityIndicator/> }</div>
  </div>
);

export default function EventStats({ event }: { event: Event | undefined }) {
  const { i18n } = useLanguageProvider();
  
  const [chartStats, setChartStats] = useState<{ name: string, sold: number, used: number }[]>([]);
  const [selectedStats, setSelectedStats] = useState<number[]>([0, 1]);
  const [stats, setStats] = useState<DataStructure>([]);
  const [higherStat, setHigherStat] = useState<number>(0);

  const {  width } = useWindowDimensions();

  const getStats = async (eventId: number, unmounted: boolean) => {
    const { data, error } = await supabase.functions.invoke('get-sold-tickets-stat', {
      body: { eventId: eventId },
    });
    if (error || unmounted) return;

    setStats(data[0]);
    setChartStats(data[1]);
  };

  useEffect(() => {
    setHigherStat(Math.max(...stats.map(stat => stat.data ?? 0)));
  }, [stats]);

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
        return 'text';
    }
  };

  const findFollowingStat = () => {
    return stats.find(({ key }) => key === 'following');
  };
  const followingStat = findFollowingStat();

  return (
    <div className="eventStatsContainer">
      <p className="usersFollowingStat">{ followingStat ? i18n?.t(followingStat.subtitle) : 'Usuaris seguint l\'esdeveniment' }: <b>{ stats.find(({ key }) => key === 'following')?.data }</b></p>
      <div className="boxContainer">
        { !stats || !stats?.length ? 
          <ActivityIndicator />
        : <>
          {stats.map(({ key, subtitle, data }, index) => (
            key !== 'following' ? <Box number={typeof data === 'number' ? data : 0} i18n={i18n} subtitle={subtitle} onClick={() => handleSelectedStat(index)} key={index} styles={{ backgroundColor: selectedStats.includes(index) ? getBoxSelectedBackgroundColor(key) : '', borderColor: selectedStats.includes(index) ? getBoxSelectedColor(key) : '#8C90A3' }} /> : null
          ))}
        </> }
      </div>
      <div className="chartContainer">
        { chartStats.length ? <>
          <AreaChart width={width-30} height={500} data={chartStats}>
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
            <XAxis dataKey="formattedName" angle={-60} textAnchor="end" tick={{ fontSize: 13 }} tickMargin={5} height={100} />
            <YAxis tickMargin={3} width={higherStat?.toString()?.length * 13 < 30 ? 30 : higherStat?.toString()?.length * 13} />
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
