import { useEffect, useState } from "react";
import api from "../api/api";

const useSearchProducts = (query) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return setResults([]);

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products?search=${query}`);
        setResults(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Search failed:", err);
        setLoading(false);
      }
    }, 500); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return { results, loading };
};

export default useSearchProducts;
