import { useState } from 'react';
import '../styles/components/EventConfig.css';
import { useLanguageProvider } from '../utils/LanguageProvider';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';

export default function EventScanner({ event_id }: { event_id: number | undefined }) {
  const { i18n } = useLanguageProvider();

  const [qrResult, setQrResult] = useState<string>('');

  const handleScan = (data: IDetectedBarcode[]) => {
    if (data) {
      console.log(data);
      setQrResult(data[0].rawValue);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

  return (
    <div className="scannerContainer">
      <Scanner
        formats={['qr_code']}
        allowMultiple={false}
        onScan={handleScan}
        onError={handleError}
        styles={{
          finderBorder: 0,
          container: {
            width: '90%',
            height: '90%'
          },
          video: {
            borderRadius: '10px'
          }
        }}
      />
      <div className="resultsContainer">
        <p>{qrResult}</p>
      </div>
    </div>
  );
}
