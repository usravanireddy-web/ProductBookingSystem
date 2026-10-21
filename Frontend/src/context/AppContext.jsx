import { createContext, useContext, useState } from 'react';
import { request } from '../api';

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('booking_token'));
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('booking_user') || 'null'),
  );
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stock, setStock] = useState([]);
  const [history, setHistory] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const login = async (username, password) => {
    const data = await request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('booking_token', data.token);
    localStorage.setItem('booking_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };
  const register = async (fullName, username, mobileNumber, password) => {
    const data = await request('/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, username, mobileNumber, password }),
    });
    localStorage.setItem('booking_token', data.token);
    localStorage.setItem('booking_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem('booking_token');
    localStorage.removeItem('booking_user');
    setToken(null);
    setUser(null);
    setProducts([]);
    setBookings([]);
    setStock([]);
    setHistory([]);
    setCart([]);
    setWishlist([]);
  };
  const refresh = async (activeToken = token) => {
    const calls = [
      request('/products', {}, activeToken),
      request('/bookings', {}, activeToken),
      request('/stock-inventory', {}, activeToken),
      request('/booking-history', {}, activeToken),
    ];
    if (user?.role !== 'admin') calls.push(request('/users/me/shop', {}, activeToken));
    const [p, b, s, h, shop] = await Promise.all(calls);
    setProducts(p.products);
    setBookings(b.bookings);
    setStock(s.stock);
    setHistory(h.history);
    if (shop) {
      setCart(shop.cart);
      setWishlist(shop.wishlist);
    }
  };
  const createBooking = async (productId, requiredQuantity) => {
    const result = await request(
      '/bookings',
      { method: 'POST', body: JSON.stringify({ productId, requiredQuantity }) },
      token,
    );
    await refresh();
    return result;
  };
  const createProduct = async (name, price, initialQuantity) => {
    const result = await request(
      '/products',
      { method: 'POST', body: JSON.stringify({ name, price, initialQuantity }) },
      token,
    );
    await refresh();
    return result;
  };
  const updateProduct = async (id, name, price, quantity) => {
    const result = await request(
      `/products/${id}`,
      { method: 'PUT', body: JSON.stringify({ name, price, quantity }) },
      token,
    );
    await refresh();
    return result;
  };
  const deleteProduct = async (id) => {
    const result = await request(`/products/${id}`, { method: 'DELETE' }, token);
    await refresh();
    return result;
  };
  const addStockQuantity = async (productId, quantity) => {
    const result = await request(
      `/stock-inventory/${productId}/add`,
      { method: 'POST', body: JSON.stringify({ quantity }) },
      token,
    );
    await refresh();
    return result;
  };
  const saveCart = async (items) => {
    const result = await request(
      '/users/me/cart',
      { method: 'PUT', body: JSON.stringify({ items }) },
      token,
    );
    setCart(result.cart);
    return result.cart;
  };
  const saveWishlist = async (productIds) => {
    const result = await request(
      '/users/me/wishlist',
      { method: 'PUT', body: JSON.stringify({ productIds }) },
      token,
    );
    setWishlist(result.wishlist);
    return result.wishlist;
  };
  const allocate = async (id, quantity) => {
    const result = await request(
      `/bookings/${id}/allocate`,
      { method: 'POST', body: JSON.stringify({ quantity }) },
      token,
    );
    await refresh();
    return result;
  };
  const manufacture = async (id) => {
    const result = await request(`/bookings/${id}/manufacture`, { method: 'POST' }, token);
    await refresh();
    return result;
  };
  return (
    <AppContext.Provider
      value={{
        token,
        user,
        products,
        bookings,
        stock,
        history,
        cart,
        wishlist,
        login,
        register,
        logout,
        refresh,
        createBooking,
        createProduct,
        updateProduct,
        deleteProduct,
        addStockQuantity,
        saveCart,
        saveWishlist,
        allocate,
        manufacture,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export const useApp = () => useContext(AppContext);
