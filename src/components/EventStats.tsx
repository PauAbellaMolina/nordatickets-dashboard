import '../styles/components/EventStats.css';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Event } from '../../types/supabaseplain';
import { ActivityIndicator } from './ActivityIndicator';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import useWindowDimensions from '../utils/useWindowDimensions';
import { useLanguageProvider } from '../utils/LanguageProvider';
import { I18n } from 'i18n-js';
import Modal from './Modal';
import TicketsTable from './TicketsTable';
import TicketsSummaryTable from './TicketsSummaryTable';

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

type TicketsTableStruct = {
  user_fullname: string;
  user_email: string;
  tickets: {
    id: number;
    event_tickets_name: string;
    price: number;
    used_at: string;
    ticket_form_submit: string[];
  }[];
}[];

type TicketsSummaryTableStruct = {
  event_tickets_name: string;
  revenue: number;
  quantitySold: number;
  quantityUsed: number;
}[];

const Box: React.FC<BoxProps> = ({ number, i18n, subtitle, onClick, styles }) => (
  <div className="box" onClick={onClick} style={styles}>
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
  const [ticketsTableData, setTicketsTableData] = useState<TicketsTableStruct>([]);
  const [ticketsSummaryTableData, setTicketsSummaryTableData] = useState<TicketsSummaryTableStruct>([]);
  const [waitingForTableData, setWaitingForTableData] = useState(false);
  const [waitingForSummaryTableData, setWaitingForSummaryTableData] = useState(false);
  const [selectedFormSubmit, setSelectedFormSubmit] = useState<string[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Should match the edge function default value
  const [totalPages, setTotalPages] = useState(1);

  const { width } = useWindowDimensions();

  useEffect(() => {
    setHigherStat(Math.max(...stats.map(stat => stat.data ?? 0)));
  }, [stats]);

  useEffect(() => {
    if (!event) return;
    setChartStats([]);
    setSelectedStats([0, 1]);
    setStats([]);
    setTicketsTableData([]);
    setTicketsSummaryTableData([]);
    setHigherStat(0);
    setCurrentPage(1);
    setTotalPages(1);
    setWaitingForTableData(false);
    setWaitingForSummaryTableData(false);
    setIsModalOpen(false);
    let unmounted = false;

    getStats(event.id, unmounted);
    getTicketsSummaryTableData(event.id, unmounted);

    return () => {
      unmounted = true;
    };
  }, [event]);

  useEffect(() => {
    if (!event) return;
    let unmounted = false;

    getTicketsTableData(event.id, unmounted, currentPage);

    return () => {
      unmounted = true;
    };
  }, [event, currentPage]);

  const getStats = async (eventId: number, unmounted: boolean) => {
    const { data, error } = await supabase.functions.invoke('get-sold-tickets-stat', {
      body: { eventId: eventId }
    });
    if (error || unmounted) return;

    setStats(data[0]);
    
    setChartStats(data[1]);
  };

  const getTicketsTableData = async (eventId: number, unmounted: boolean, page: number) => {
    setWaitingForTableData(true);
    const { data, error } = await supabase.functions.invoke('get-tickets-table-data', {
      body: { eventId: eventId, page: page, pageSize: itemsPerPage }
    });
    if (error || unmounted) return;

    setTicketsTableData(data.tickets);
    setTotalPages(data.totalPages);
    setCurrentPage(data.currentPage);
    setWaitingForTableData(false);
  };

  const getTicketsSummaryTableData = async (eventId: number, unmounted: boolean) => {
    setWaitingForSummaryTableData(true);
    const { data, error } = await supabase.functions.invoke('get-tickets-summary-table-data', {
      body: { eventId: eventId }
    });
    if (error || unmounted) return;

    setTicketsSummaryTableData(data);
    setWaitingForSummaryTableData(false);
  };

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

  const handleFormSubmitClick = (formSubmit: string[]) => {
    setSelectedFormSubmit(formSubmit);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (waitingForTableData) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="eventStatsContainer">
      <p className="usersFollowingStat">{ followingStat ? i18n?.t(followingStat.subtitle) : 'Usuaris seguint l\'esdeveniment' }: <b>{ stats.find(({ key }) => key === 'following')?.data }</b></p>
      { !stats || !stats?.length ?  
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '15dvh'}}>
          <ActivityIndicator />
        </div>
      :
      <div className="boxContainer">
        {stats.map(({ key, subtitle, data }, index) => (
          key !== 'following' ? <Box number={typeof data === 'number' ? data : 0} i18n={i18n} subtitle={subtitle} onClick={() => handleSelectedStat(index)} key={index} styles={{ backgroundColor: selectedStats.includes(index) ? getBoxSelectedBackgroundColor(key) : '', borderColor: selectedStats.includes(index) ? getBoxSelectedColor(key) : '#8C90A3' }} /> : null
        ))}
      </div>
      }
      { chartStats.length ?
        <div className="graphSummaryContainer">
          <span>{ i18n?.t("ticketsGraph") }</span>
          <div className="chartContainer">
            <AreaChart width={width-50} height={400} data={chartStats}>
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
              <YAxis tickMargin={3} width={higherStat?.toString()?.length * 13 < 30 ? 35 : higherStat?.toString()?.length * 13} />
              <CartesianGrid strokeDasharray="3 3" opacity={.5} />
              <Tooltip labelStyle={{ color: 'black' }} />
              <Area type="monotone" dataKey={selectedStats.includes(0) ? 'sold' : ''} stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
              <Area type="monotone" dataKey={selectedStats.includes(1) ? 'used' : ''} stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
            </AreaChart>
          </div>

          { ticketsSummaryTableData.length ?
            <TicketsSummaryTable
              ticketsSummaryTableData={ticketsSummaryTableData}
              waitingForTableData={waitingForSummaryTableData}
              i18n={i18n}
            />
          : null }
        </div>
      : null }

      { ticketsTableData.length ?
        <div className="ticketsTableContainer">
          <span>{ i18n?.t("ticketsTable") }</span>
          <TicketsTable
            ticketsTableData={ticketsTableData}
            waitingForTableData={waitingForTableData}
            i18n={i18n}
            handleFormSubmitClick={handleFormSubmitClick}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </div>
      : null }

      { isModalOpen && selectedFormSubmit && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 style={{ marginTop: '0' }}>{ i18n?.t("formSubmissionsDetail") }</h2>
          <div className="submissionsContainer">
            {selectedFormSubmit.map((submission, index) => (
              <p key={index} className={index % 2 === 0 ? 'even' : 'odd'}>{submission}</p>
            ))}
          </div>
        </Modal>
      ) }
    </div>
  );
}
