import './styles/Auth.css'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  // const { signInWithOTP, verifyOTP, i18n, theme } = useSupabase();
  // const params = useGlobalSearchParams();

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

    supabase.rpc('organizer_email_exists', { email_to_check: email })
    .then(({ data: exists, error }) => {
      if (error || !exists) {
        setEmailErrorMessage('tryAgain');
        setLoading(false);
        return;
      }
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
      <h1 className="title">{ 'logIn' }</h1>
      <p className="explanation">{ 'emailCodeExplanation' }</p>
      <div className="inputContainer">
        { !emailSent ?
          <input
            type="email"
            className="input"
            placeholder={ 'email' }
            onChange={(e) => setEmail(e.target.value)}
          />
        : <>
          <div className="emailSubmitted">
            <p className="email">{email}</p>
            <button onClick={onChangeEmail}>
              {/* <FeatherIcon name="edit-2" size={18} color="#FCFCFC" /> */}
            </button>
          </div>
          <input
            type="number"
            className="input"
            placeholder={ 'oneTimeCode' }
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
            <span>Loading...</span>
          : 
            <>
              { !emailSent ?
                <button
                  disabled={!email.includes('@')}
                  className="button"
                  onClick={onEmailLogIn}
                >
                  <span className="buttonText">{ 'send' }</span>
                </button>
              :
                <button
                  disabled={oneTimeCode.length !== 6}
                  className="button"
                  onClick={onCodeSubmit}
                >
                  <span className="buttonText">{ 'enter' }</span>
                </button>
              }
            </>
          }
        </div>
      </div>
    </div>
  );
}