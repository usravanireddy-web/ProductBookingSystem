export function SearchInput({ value, onChange, placeholder }) {
  return (
    <label className="search-box">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </svg>
      <input className="search-input" placeholder={placeholder} value={value} onChange={onChange} />
    </label>
  );
}
