import './styles/Home.css'
import { ChangeEvent, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Event } from '../types/supabaseplain';
import { Session } from '@supabase/supabase-js';
import { ActivityIndicator } from './components/ActivityIndicator';
import EventStats from './components/EventStats';
import ChevronDown from './assets/chevron-down.svg';

export default function Home({ session }: { session: Session }) {
  const { user } = session;
  const [events, setEvents] = useState<Event[] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: number, name: string } | null>(null);

  useEffect(() => {
    if (!user || !user?.email) return;
    let unmounted = false;

    supabase.rpc('email_is_admin', { email_to_check: user.email })
    .then(({ data: isAdmin, error }) => {
      if (unmounted || error) return;
      if (isAdmin) {
        supabase.from('events').select()
        .then(({ data: events, error }) => {
          if (unmounted || error || !user || !events.length) return;
          setEvents(events);
          setSelectedEvent({ id: events[0].id, name: events[0].name ?? '' });
        });
      } else {
        if (!user.email) return;
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
      }
    });

    return () => {
      unmounted = true;
    };
  }, [user]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent({ id: +e.target.value || 0, name: events?.find(event => event.id === +e.target.value)?.name ?? '' });
  };

  return (
    <div className="homeContainer">
      { !events ?
        <ActivityIndicator />
      : <>
        <div>
          { events.length > 1 ? <>
            <select className="eventSelect" value={selectedEvent?.id} onChange={handleSelectChange}>
              {events.map((event, index) => (
                <option key={index} value={event.id}>{event.name}</option>
              ))}
            </select>
            <img src={ChevronDown} alt="chevron down" className="chevronDown" />
            <p className="infoLabel">Tria un dels esdeveniments per veure els detalls</p>
          </> : <>
            <h1 className="title">{events[0]?.name}</h1>
            <p className="infoLabel">Detalls de l'esdeveniment</p>
          </>}
        </div>
        <EventStats event={events.find(event => event.id === selectedEvent?.id)} />  
      </> }
      <button className="signOutButton" onClick={() => supabase.auth.signOut()}>Tancar sessió</button>
    </div>
  );
}