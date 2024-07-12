import './styles/Home.css'
import { ChangeEvent, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Event } from '../types/supabaseplain';
import { Session } from '@supabase/supabase-js';
import { ActivityIndicator } from './components/ActivityIndicator';
import EventStats from './components/EventStats';
import ChevronDown from './assets/chevron-down.svg';
import Settings from './assets/settings.svg';
import BarChart from './assets/bar-chart.svg';
import { useLanguageProvider } from './utils/LanguageProvider';
import { AvailableLocales } from './utils/translations/translation';
import EventConfig from './components/EventConfig';

export default function Home({ session }: { session: Session }) {
  const { i18n, setLanguage } = useLanguageProvider();
  
  const { user } = session;
  const [events, setEvents] = useState<Event[] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: number, name: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<AvailableLocales>();
  const [configMode, setConfigMode] = useState<boolean>(false);

  useEffect(() => {
    setSelectedLanguage(i18n?.locale as AvailableLocales);
  }, [i18n]);

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
        supabase.from('events').select().eq('organizer_email', user.email)
        .then(({ data: events, error }) => {
          if (unmounted || error || !user || !events.length) return;
          setEvents(events);
          setSelectedEvent({ id: events[0].id, name: events[0].name ?? '' });
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

  const onClickSettings = () => {
    setConfigMode(!configMode);
  }

  const onSelectedLanguage = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!i18n) return;
    const language = e.target.value as AvailableLocales;
    setSelectedLanguage(language);
    setLanguage(language);
  };

  return (
    <div className="homeContainer">
      { !events ?
        <ActivityIndicator />
      : <>
        <div className="headerContainer">
          { events.length > 1 ? 
            <div className="headerSelectContainer">
              <select className="eventSelect" value={selectedEvent?.id} onChange={handleSelectChange}>
                {events.map((event, index) => (
                  <option key={index} value={event.id}>{event.name}</option>
                ))}
              </select>
              <img src={ChevronDown} alt="chevron down" className="chevronDown" />
            </div>
          :
            <h1 className="title">{events[0]?.name}</h1>
          }
          <img src={!configMode ? Settings : BarChart} alt="settings" className="settings" onClick={onClickSettings} />
        </div>
        { configMode ?
          <EventConfig event={events.find(event => event.id === selectedEvent?.id)} />
        :
          <EventStats event={events.find(event => event.id === selectedEvent?.id)} />
        }
      </> }
      <select className="langSelect" value={selectedLanguage} onChange={(e: ChangeEvent<HTMLSelectElement>) => onSelectedLanguage(e)}>
        <option value="ca">Català</option>
        <option value="es">Castellano</option>
        <option value="en">English</option>
      </select>
      <button className="signOutButton" onClick={() => supabase.auth.signOut()}>{ i18n?.t('logOut') }</button>
    </div>
  );
}