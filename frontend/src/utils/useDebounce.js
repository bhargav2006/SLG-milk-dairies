import { useState, useEffect } from "react";

// Returns `value` only after it has stopped changing for `delay` ms.
// Used for search boxes so we don't call the server on every keystroke.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
