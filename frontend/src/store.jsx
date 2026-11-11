import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api';

const Store = createContext();
export const useStore = () => useContext(Store);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wish, setWish] = useState([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(curr => (curr && curr.message === message ? null : curr));
    }, 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setCart(data.cart || []);
      setWish(data.wishlist || []);
    } catch {
      setUser(null);
      setCart([]);
      setWish([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Store.Provider value={{ user, cart, wish, ready, load, toast, notify }}>
      {children}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </Store.Provider>
  );
}
