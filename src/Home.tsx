import './styles/Home.css'
import { ChangeEvent, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Event } from '../types/supabaseplain';
import { Session } from '@supabase/supabase-js';
import { ActivityIndicator } from './components/ActivityIndicator';
import EventStats from './components/EventStats';

export default function Home({ session }: { session: Session }) {
  const { user } = session;
  const [events, setEvents] = useState<Event[] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: number, name: string } | null>(null);

  useEffect(() => {
    if (!user || !user?.email) return;
    let unmounted = false;
    supabase.from('organizers').select().eq('email', user.email).single()
    .then(({ data: organizer, error }) => {
      if (unmounted || error || !user || !organizer) return;
      supabase.from('events').select().eq('organizer_id', organizer.id)
      .then(({ data: events, error }) => {
        if (unmounted || error || !user || !events.length) return;
        setEvents(events);
        setSelectedEvent({ id: events[0].id, name: events[0].name ?? '' });
      });
    });

    return () => {
      unmounted = true;
    };
  }, [user]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent({ id: events?.find(event => event.name === e.target.value)?.id ?? 0, name: e.target.value });
  };

  return (
    <div className="homeContainer">
      { !events ?
        <ActivityIndicator />
      : <>
        <div>
          { events.length > 1 ? <>
            <select className="eventSelect" value={selectedEvent?.name} onChange={handleSelectChange}>
              {events.map((event, index) => (
                <option key={index} value={event.id}>{event.name}</option>
              ))}
            </select>
            <p className="infoLabel">Tria un dels esdeveniments per veure els detalls</p>
          </> : <>
            <h1 className="title">{events[0]?.name}</h1>
            <p className="infoLabel">Detalls de l'esdeveniment</p>
          </>}
        </div>
        <EventStats event={events.find(event => event.id === selectedEvent?.id)} />  
      </> }
    </div>
  );
}