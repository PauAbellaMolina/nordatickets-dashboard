import './styles/Home.css'
import { ChangeEvent, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Event } from '../types/supabaseplain';
import { Session } from '@supabase/supabase-js';
import EventStats from './components/EventStats';
import EventConfig from './components/EventConfig';
import EventScanner from './components/EventScanner';
import ChevronDown from './assets/chevron-down.svg';
import Settings from './assets/settings.svg';
import BarChart from './assets/bar-chart.svg';
import Camera from './assets/camera.svg';
import { useLanguageProvider } from './utils/LanguageProvider';
import { AvailableLocales } from './utils/translations/translation';
import TicketLogo from './assets/ticket-logo.svg';
import Logout from './assets/logout.svg';

export default function Home({ session }: { session: Session }) {
  const { i18n, setLanguage } = useLanguageProvider();
  
  const { user } = session;
  const [events, setEvents] = useState<Event[] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: number, name: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<AvailableLocales>();
  const [screenMode, setScreenMode] = useState<'st' | 'co' | 'sc'>('st');

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
    setScreenMode(screenMode === 'co' || screenMode === 'sc' ? 'st' : 'co');
  };

  const onClickCamera = () => {
    setScreenMode('sc');
  };

  const onSelectedLanguage = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!i18n) return;
    const language = e.target.value as AvailableLocales;
    setSelectedLanguage(language);
    setLanguage(language);
  };

  return (
    <div className="homeContainer">
      { !events ?
        <div className="homeSplashContainer">
          <img src={TicketLogo} alt="logo icon" className="ticketLogo" />
        </div>
      : <>
        <div className="headerContainer">
          { events.length > 1 ? 
            <div className="headerSelectContainer">
              <select className="eventSelect" value={selectedEvent?.id} onChange={handleSelectChange}>
                {events.map((event, index) => (
                  <option key={index} value={event.id}>{event.name}</option>
                ))}
              </select>
              <img src={ChevronDown} alt="open dropdown select" className="chevronDown select" />
            </div>
          :
            <h1 className="eventTitle">{events[0]?.name}</h1>
          }
          <div className="iconsContainer">
            { screenMode === 'st' || screenMode === 'co' ?
              <img src={Camera} alt="camera" className="icon" onClick={onClickCamera} />
            : null }
            <img src={screenMode === 'st' ? Settings : BarChart} alt="settings" className="icon" onClick={onClickSettings} />
          </div>
        </div>
        <div style={{height: '100%', display: screenMode === 'co' ? 'unset' : 'none'}}>
          <EventConfig event_id={events.find(event => event.id === selectedEvent?.id)?.id} />
        </div>
        <div style={{height: '100%', display: screenMode === 'st' ? 'unset' : 'none'}}>
          <EventStats event={events.find(event => event.id === selectedEvent?.id)} />
        </div>
        { screenMode === 'sc' ?
          <div style={{height: '100%'}}>
            <EventScanner event_id={events.find(event => event.id === selectedEvent?.id)?.id} />
          </div>
        : null }
      </> }
      <div className="footerContainer">
        <select className="langSelect" value={selectedLanguage} onChange={(e: ChangeEvent<HTMLSelectElement>) => onSelectedLanguage(e)}>
          <option value="ca">Català</option>
          <option value="es">Castellano</option>
          <option value="en">English</option>
        </select>
        <button className="signOutButton" onClick={() => supabase.auth.signOut()}>
          <img src={Logout} alt="logout" className="logout" />
          { i18n?.t('logOut') }
        </button>
      </div>
    </div>
  );
}