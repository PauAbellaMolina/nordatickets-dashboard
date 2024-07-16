import '../styles/components/Switch.css';

export function Switch({ id, checked, handleCheck }: { id: string, checked: boolean, handleCheck: () => void }) {
  
  return (
    <>
      <input
        checked={checked}
        onChange={handleCheck}
        className="react-switch-checkbox"
        id={`switch-`+id}
        type="checkbox"
      />
      <label
        style={{ background: checked ? '#66CA65' : '#80808080' }}
        className="react-switch-label"
        htmlFor={`switch-`+id}
      >
        <span className={`react-switch-button`} />
      </label>
    </>
  );
}