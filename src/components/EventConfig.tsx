import '../styles/components/EventConfig.css';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Event, EventTicket } from '../../types/supabaseplain';
import { ActivityIndicator } from './ActivityIndicator';
import { useLanguageProvider } from '../utils/LanguageProvider';
import { I18n } from 'i18n-js';

interface ConfigBoxProps {
  title: string;
  selling: boolean | null | undefined;
  i18n: I18n | null;
  onAction: () => void;
  styles: React.CSSProperties;
}

const ConfigBox: React.FC<ConfigBoxProps> = ({ title, selling, i18n, onAction, styles }) => (
  <div className="configBox" style={styles}>
    <div className="configBoxTitleContainer">
      <div className={`sellingStatusDot ${selling ? 'green' : 'red'}`}></div>
      <div className="title">{ title }</div>
    </div>
    <div className="action" onClick={onAction}>{ i18n?.t(selling ? 'deactivateSelling' : 'activateSelling') }</div>
  </div>
);

export default function EventConfig({ event }: { event: Event | undefined }) {
  const { i18n } = useLanguageProvider();
  
  const [accessEventTickets, setAccessEventTickets] = useState<EventTicket[]>();
  const [eventTickets, setEventTickets] = useState<EventTicket[]>();
  const [localEvent, setLocalEvent] = useState<Event | undefined>(event);

  useEffect(() => {
    if (!event) return;
    setLocalEvent(event);
    let unmounted = false;

    supabase.from('event_tickets').select().eq('event_id', event.id).eq('type', 'ACCESS').order('price')
    .then(({ data: event_tickets, error }) => {
      if (unmounted || error || !event_tickets.length) {
        setAccessEventTickets([]);
        return;
      }
      setAccessEventTickets(event_tickets);
    });

    supabase.from('event_tickets').select().eq('event_id', event.id).in('type', ['CONSUMABLE', 'ADDON', 'ADDON_REFUNDABLE']).order('type', { ascending: true }).order('name')
      .then(({ data: event_tickets, error }) => {
        if (unmounted || error || !event_tickets.length) return;
        const typeOrder = ['ADDON_REFUNDABLE', 'ADDON'];
        const typeOrderMap = new Map(typeOrder.map((type, index) => [type, index]));
        const orderedEventTickets = event_tickets.sort((a, b) => {
          const aIndex = typeOrderMap.has(a.type) ? typeOrderMap.get(a.type) : typeOrder.length;
          const bIndex = typeOrderMap.has(b.type) ? typeOrderMap.get(b.type) : typeOrder.length;
          return (aIndex ?? 0) - (bIndex ?? 0);
        });
        setEventTickets(orderedEventTickets);
      });

    return () => {
      unmounted = true;
    };
  }, [event]);

  const handleGeneralTicketsSellingAction = () => {
    if (!localEvent) return;
    supabase.from('events').update({ selling: !localEvent.selling }).eq('id', localEvent.id).select().single()
    .then(({ data: event, error }) => {
      if (error) return;
      setLocalEvent(event);
    });
  };
  const handleGeneralAccessSellingAction = () => {
    if (!localEvent) return;
    supabase.from('events').update({ selling_access: !localEvent.selling_access }).eq('id', localEvent.id).select().single()
    .then(({ data: event, error }) => {
      if (error) return;
      setLocalEvent(event);
    });
  };

  const handleAccessSellingAction = (id: number, selling: boolean) => {
    supabase.from('event_tickets').update({ selling: !selling }).eq('id', id).select().single()
    .then(({ data: event_ticket, error }) => {
      if (error) return;
      setAccessEventTickets(accessEventTickets?.map(ticket => ticket.id === event_ticket.id ? event_ticket : ticket));
    });
  }

  const handleTicketsSellingAction = (id: number, selling: boolean) => {
    supabase.from('event_tickets').update({ selling: !selling }).eq('id', id).select().single()
    .then(({ data: event_ticket, error }) => {
      if (error) return;
      setEventTickets(eventTickets?.map(ticket => ticket.id === event_ticket.id ? event_ticket : ticket));
    });
  }

  return (
    <div className="eventConfigContainer">
      <h3>{ i18n?.t('eventConfiguration') }</h3>
      <div className="configBoxContainer">
        <p>{ i18n?.t('generalSelling') }</p>
        <ConfigBox title="Tickets" selling={localEvent?.selling} i18n={i18n} onAction={() => handleGeneralTicketsSellingAction()} styles={{}} />
        <ConfigBox title="Entrades" selling={localEvent?.selling_access} i18n={i18n} onAction={() => handleGeneralAccessSellingAction()} styles={{}} />
      </div>
      { accessEventTickets?.length ?
        <div className="configBoxContainer">
          <p>{ i18n?.t('accessTickets') }:</p>
          {accessEventTickets.map(({ name, price, selling, id }, index) => (
            <ConfigBox key={index} title={name + ' · ' + price + '€'} selling={selling} i18n={i18n} onAction={() => handleAccessSellingAction(id, selling)} styles={{marginBottom: 5}} />
          ))}
        </div>
      : null }
      { eventTickets?.length ?
        <div className="configBoxContainer">
          <p>Tickets:</p>
          {eventTickets.map(({ name, price, selling, id }, index) => (
            <ConfigBox key={index} title={name + ' · ' + price + '€'} selling={selling} i18n={i18n} onAction={() => handleTicketsSellingAction(id, selling)} styles={{marginBottom: 5}} />
          ))}
        </div>
      : 
        <div className="activityIndicator">
          <ActivityIndicator />
        </div>
      }
    </div>
  );
}
