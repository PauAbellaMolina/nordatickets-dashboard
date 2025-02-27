import './styles/App.css';
import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Auth from './Auth';
import Home from './Home';
import { LanguageProvider } from './utils/LanguageProvider';

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [realSession, setRealSession] = useState<Session | null>(null)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setRealSession(null);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!realSession && session) {
      setRealSession(session);
    }
    if (realSession && session && session?.access_token !== realSession?.access_token) {
      setRealSession(session);
    }
  }, [session, realSession]);

  return (
    <LanguageProvider>
      { !realSession ? 
        <Auth />
      :
        <Home key={realSession.user.id} session={realSession} />
      }
    </LanguageProvider>
  );
}

export default App;