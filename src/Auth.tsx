import './styles/Auth.css'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import EditPencil from './assets/edit-2.svg';
import { ActivityIndicator } from './components/ActivityIndicator';

export default function Auth() {
  const [email, setEmail] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | undefined>(undefined);
  const [oneTimeCode, setOneTimeCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailErrorMessage !== undefined) {
      setEmailErrorMessage(undefined);
    }
  }, [email, emailErrorMessage]);

  const onEmailLogIn = () => {
    setEmailErrorMessage(undefined);
    setLoading(true);

    supabase.rpc('email_is_admin', { email_to_check: email })
    .then(({ data: isAdmin, error }) => {
      if (error) {
        setEmailErrorMessage('tryAgain');
        setLoading(false);
        return;
      }
      if (isAdmin) {
        sendEmail();
      } else {
        supabase.rpc('organizer_email_exists', { email_to_check: email })
        .then(({ data: exists, error }) => {
          if (error || !exists) {
            setEmailErrorMessage('tryAgain');
            setLoading(false);
            return;
          }
          sendEmail();
        });
      }
    });
    
  };

  const sendEmail = () => {
    //One time password (OTP)
    // const langMetaData = authEmailsTranslations[i18n.locale as AvailableLocales];
    supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
        // data: langMetaData
      }
    })
    .then(() => {
      setEmailSent(true);
    })
    .catch(() => {
      setEmailSent(false);
      // setEmailErrorMessage(i18n?.t('tryAgain'));
      setEmailErrorMessage('tryAgain');
    })
    .finally(() => {
      //TODO PAU show email sent message
      setLoading(false);
    });
  };

  const onChangeEmail = () => {
    setEmailSent(false);
    setEmailErrorMessage(undefined);
    setLoading(false);
  };

  const onCodeSubmit = () => {
    setEmailErrorMessage(undefined);
    setLoading(true);
    supabase.auth.verifyOtp({
      email,
      token: oneTimeCode.toString(),
      type: 'email'
    })
    .catch(() => {
      // setEmailErrorMessage(i18n?.t('tryAgain'));
      setEmailErrorMessage('tryAgain');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="wrapper">
      <h1 className="title">Iniciar sessió</h1>
      <p className="explanation">T'enviarem un codi de 6 dígits al correu electrònic</p>
      <div className="inputContainer">
        { !emailSent ?
          <input
            type="email"
            inputMode="email"
            className="input"
            placeholder="Correu electrònic"
            onChange={(e) => setEmail(e.target.value)}
          />
        : <>
          <div className="emailSubmitted">
            <p className="email">{email}</p>
            <img onClick={onChangeEmail} src={EditPencil} alt="edit email" className="editPencil" />
          </div>
          <input
            type="number"
            inputMode="numeric"
            className="input"
            placeholder="Codi d'un sol ús"
            onChange={(e) => setOneTimeCode(e.target.value)}
          />
        </>}
        { emailErrorMessage ?
          <p className="inputErrorMessage">{emailErrorMessage}</p>
        :
          null
        }
        <div>
          { loading ?
            <ActivityIndicator />
          : 
            <>
              { !emailSent ?
                <button
                  disabled={!email.includes('@')}
                  className="button"
                  onClick={onEmailLogIn}
                >
                  <span className="buttonText">Enviar</span>
                </button>
              :
                <button
                  disabled={oneTimeCode.length !== 6}
                  className="button"
                  onClick={onCodeSubmit}
                >
                  <span className="buttonText">Entrar</span>
                </button>
              }
            </>
          }
        </div>
      </div>
    </div>
  );
}