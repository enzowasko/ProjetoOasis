import './Button.css';

export function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button className={`btn-atom ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}