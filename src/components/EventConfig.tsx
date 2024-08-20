import '../styles/components/EventConfig.css';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Event, EventTicket } from '../../types/supabaseplain';
import { ActivityIndicator } from './ActivityIndicator';
import { useLanguageProvider } from '../utils/LanguageProvider';
import { Switch } from './Switch';

interface ConfigBoxProps {
  id: string;
  title: string;
  selling: boolean | null | undefined;
  onAction: () => void;
}

const ConfigBox: React.FC<ConfigBoxProps> = ({ id, title, selling, onAction }) => (
  <div className="configBox">
    <div className="configBoxTitleContainer">
      <div className={`sellingStatusDot ${selling ? 'green' : 'red'}`}></div>
      <div className="title">{ title }</div>
    </div>
    <Switch id={id} checked={!!selling} handleCheck={onAction} />
  </div>
);

export default function EventConfig({ event_id }: { event_id: number | undefined }) {
  const { i18n } = useLanguageProvider();
  
  const [accessEventTickets, setAccessEventTickets] = useState<EventTicket[]>();
  const [eventTickets, setEventTickets] = useState<EventTicket[]>();
  const [event, setEvent] = useState<Event | undefined>();

  useEffect(() => {
    if (!event_id) return;
    setAccessEventTickets([]);
    setEventTickets([]);
    let unmounted = false;

    supabase.from('events').select().eq('id', event_id).single()
    .then(({ data: event, error }) => {
      if (unmounted || error || !event) {
        return;
      }
      setEvent(event);
    });

    supabase.from('event_tickets').select().eq('event_id', event_id).eq('type', 'ACCESS').order('price')
    .then(({ data: event_tickets, error }) => {
      if (unmounted || error || !event_tickets.length) {
        setAccessEventTickets([]);
        return;
      }
      setAccessEventTickets(event_tickets);
    });

    supabase.from('event_tickets').select().eq('event_id', event_id).in('type', ['CONSUMABLE', 'ADDON', 'ADDON_REFUNDABLE']).order('type', { ascending: true }).order('name')
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
  }, [event_id]);

  const handleGeneralTicketsDeactivableAction = () => {
    if (!event) return;
    if (event.tickets_deactivable) {
      if (!window.confirm(i18n?.t('deactivateGeneralTicketDeactivationConfirmationQuestion'))) {
        return;
      }
    }
    supabase.from('events').update({ tickets_deactivable: !event.tickets_deactivable }).eq('id', event.id).select().single()
    .then(({ data: event, error }) => {
      if (error) return;
      setEvent(event);
    });
  }
  const handleGeneralTicketsSellingAction = () => {
    if (!event) return;
    if (event.selling) {
      if (!window.confirm(i18n?.t('deactivateGeneralTicketSellingConfirmationQuestion'))) {
        return;
      }
    }
    supabase.from('events').update({ selling: !event.selling }).eq('id', event.id).select().single()
    .then(({ data: event, error }) => {
      if (error) return;
      setEvent(event);
    });
  };
  const handleGeneralAccessSellingAction = () => {
    if (!event) return;
    if (event.selling_access) {
      if (!window.confirm(i18n?.t('deactivateGeneralAccessTicketConfirmationQuestion'))) {
        return;
      }
    }
    supabase.from('events').update({ selling_access: !event.selling_access }).eq('id', event.id).select().single()
    .then(({ data: event, error }) => {
      if (error) return;
      setEvent(event);
    });
  };

  const handleAccessSellingAction = (id: number, selling: boolean) => {
    if (selling) {
      if (!window.confirm(i18n?.t('deactivateAccessTicketConfirmationQuestion'))) {
        return;
      }
    }
    supabase.from('event_tickets').update({ selling: !selling }).eq('id', id).select().single()
    .then(({ data: event_ticket, error }) => {
      if (error) return;
      setAccessEventTickets(accessEventTickets?.map(ticket => ticket.id === event_ticket.id ? event_ticket : ticket));
    });
  }

  const handleTicketsSellingAction = (id: number, selling: boolean) => {
    if (selling) {
      if (!window.confirm(i18n?.t('deactivateTicketConfirmationQuestion'))) {
        return;
      }
    }
    supabase.from('event_tickets').update({ selling: !selling }).eq('id', id).select().single()
    .then(({ data: event_ticket, error }) => {
      if (error) return;
      setEventTickets(eventTickets?.map(ticket => ticket.id === event_ticket.id ? event_ticket : ticket));
    });
  }

  return (
    <div className="eventConfigContainer">
      <p className="configSubtitle">{ i18n?.t('eventConfiguration') }</p>
      <div className="configBoxContainer">
        <p>{ i18n?.t('generalDeactivation') }</p>
        <ConfigBox id={"generalDeactivation_" + event?.id} title="Tickets" selling={event?.tickets_deactivable} onAction={handleGeneralTicketsDeactivableAction} />
      </div>
      <div className="configBoxContainer">
        <p>{ i18n?.t('generalSelling') }</p>
        <ConfigBox id={"generalSelling" + event?.id} title="Tickets" selling={event?.selling} onAction={handleGeneralTicketsSellingAction} />
        { accessEventTickets?.length ?
          <ConfigBox id={"generalAccess" + event?.id} title={i18n?.t('accessTickets') ?? ''} selling={event?.selling_access} onAction={handleGeneralAccessSellingAction} />
        : null }
      </div>
      { accessEventTickets?.length ?
        <div className="configBoxContainer">
          <p>{ i18n?.t('accessTickets') }:</p>
          {accessEventTickets.map(({ name, price, selling, id }, index) => (
            <ConfigBox key={index} id={"general_" + id + '_' + event?.id} title={name + ' · ' + ((price ?? 0) / 100) + '€'} selling={selling} onAction={() => handleAccessSellingAction(id, selling)} />
          ))}
        </div>
      : null }
      { eventTickets?.length ?
        <div className="configBoxContainer">
          <p>Tickets:</p>
          {eventTickets.map(({ name, price, selling, id }, index) => (
            <ConfigBox key={index} id={"access_" + id + '_' + event?.id} title={name + ' · ' + ((price ?? 0) / 100) + '€'} selling={selling} onAction={() => handleTicketsSellingAction(id, selling)} />
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
