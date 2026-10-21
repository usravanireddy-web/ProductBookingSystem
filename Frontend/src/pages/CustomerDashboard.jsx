import { useEffect, useMemo, useState } from 'react';
import { Pagination } from '../components/navigation/Pagination';
import { ProductCard } from '../components/catalog/ProductCard';
import { SearchInput } from '../components/search/SearchInput';
import { matchesSearch, PAGE_SIZE, productPhoto, productPrice } from '../utils/catalog';

function Drawer({ title, children, onClose }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="shop-drawer" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p className="eyebrow">SAVED ITEMS</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-close" onClick={onClose}>
            ×
          </button>
        </header>
        {children}
      </aside>
    </div>
  );
}

function ProductDetails({ product, wished, onWish, onCart, onBack }) {
  return (
    <section className="product-details">
      <button className="back-button" onClick={onBack}>
        ← Back to products
      </button>
      <div className="details-grid">
        <img src={productPhoto(product.name, product.productId)} alt={product.name} />
        <div>
          <p className="eyebrow">{product.productId}</p>
          <h1>{product.name}</h1>
          <p className="details-copy">
            A booking-ready product from the Bookflow catalog. Add it to your cart to request the
            quantity you need with Cash on Delivery.
          </p>
          <b className="details-price">₹{productPrice(product).toLocaleString('en-IN')}</b>
          <div className="details-actions">
            <button onClick={() => onCart(product.productId)}>Add to cart</button>
            <button className="secondary" onClick={() => onWish(product.productId)}>
              {wished ? 'Remove from wishlist' : 'Add to wishlist'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CustomerDashboard({
  user,
  products,
  bookings,
  cart,
  wishlist,
  saveCart,
  saveWishlist,
  refresh,
  createBooking,
  logout,
}) {
  const [tab, setTab] = useState('catalog');
  const [drawer, setDrawer] = useState('');
  const [selected, setSelected] = useState(null);
  const [term, setTerm] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);
  useEffect(() => setProductPage(1), [term]);
  useEffect(() => {
    const productId = new URLSearchParams(window.location.search).get('productId');
    const product = products.find((item) => item.productId === productId);
    if (product) {
      setSelected(product);
      setTab('details');
    }
  }, [products]);
  const filteredProducts = useMemo(
    () => products.filter((product) => matchesSearch(product, term)),
    [products, term],
  );
  const visibleProducts = filteredProducts.slice(
    (productPage - 1) * PAGE_SIZE,
    productPage * PAGE_SIZE,
  );
  const visibleBookings = bookings.slice((bookingPage - 1) * PAGE_SIZE, bookingPage * PAGE_SIZE);
  const cartItems = cart
    .map((item) => ({
      ...item,
      product: products.find((product) => product.productId === item.productId),
    }))
    .filter((item) => item.product);
  const total = cartItems.reduce(
    (sum, item) => sum + productPrice(item.product) * item.quantity,
    0,
  );
  const addToCart = async (id) => {
    try {
      const existing = cart.find((item) => item.productId === id);
      const items = existing
        ? cart.map((item) =>
            item.productId === id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...cart, { productId: id, quantity: 1 }];
      await saveCart(items);
    } catch (err) {
      setError(err.message);
    }
  };
  const setCart = async (next) => {
    try {
      await saveCart(typeof next === 'function' ? next(cart) : next);
    } catch (err) {
      setError(err.message);
    }
  };
  const toggleWishlist = async (id) => {
    try {
      await saveWishlist(
        wishlist.includes(id) ? wishlist.filter((item) => item !== id) : [...wishlist, id],
      );
    } catch (err) {
      setError(err.message);
    }
  };
  const moveToCart = async (id) => {
    await addToCart(id);
    await toggleWishlist(id);
  };
  const goHome = () => {
    setTab('catalog');
    setSelected(null);
    setTerm('');
    setProductPage(1);
    window.history.replaceState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const checkout = async () => {
    try {
      for (const item of cartItems) await createBooking(item.productId, item.quantity);
      await setCart([]);
      setDrawer('');
      setMessage('Cash on Delivery request created. Confirmation email is being sent.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.setTimeout(() => setMessage(''), 1500);
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.setTimeout(() => setError(''), 1500);
    }
  };
  return (
    <div className="shop-shell">
      <header className="shop-header">
        <button className="shop-logo" onClick={goHome}>
          BOOK<span>FLOW</span>
        </button>
        <nav>
          <button className={tab !== 'orders' ? 'active' : ''} onClick={goHome}>
            Shop
          </button>
          <button
            className={tab === 'orders' ? 'active' : ''}
            onClick={() => {
              setBookingPage(1);
              setTab('orders');
            }}
          >
            My bookings
          </button>
        </nav>
        <div className="shop-tools">
          <button onClick={() => setDrawer('wishlist')}>
            ♡<b>{wishlist.length}</b>
          </button>
          <button onClick={() => setDrawer('cart')}>
            🛒<b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b>
          </button>
          <span>{user.username}</span>
          <button className="logout-link" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="shop-main">
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {tab === 'catalog' && (
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">CATALOG</p>
                <h2>All products</h2>
              </div>
              <SearchInput
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search products or IDs"
              />
            </div>
            {visibleProducts.length ? (
              <div className="catalog">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    wished={wishlist.includes(product.productId)}
                    onWish={toggleWishlist}
                    onCart={addToCart}
                    onOpen={(item) => {
                      setSelected(item);
                      setTab('details');
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="empty">No products match your search.</p>
            )}
            <Pagination
              page={productPage}
              setPage={setProductPage}
              count={filteredProducts.length}
            />
          </section>
        )}
        {tab === 'details' && selected && (
          <ProductDetails
            product={selected}
            wished={wishlist.includes(selected.productId)}
            onWish={toggleWishlist}
            onCart={addToCart}
            onBack={goHome}
          />
        )}
        {tab === 'orders' && (
          <section className="orders">
            <button className="back-button" onClick={goHome}>
              ← Continue shopping
            </button>
            <div className="orders-heading">
              <div>
                <p className="eyebrow">ORDER TRACKING</p>
                <h2>My booking requests</h2>
                <span>Track every Cash on Delivery request in one place.</span>
              </div>
              <b>{bookings.length} total</b>
            </div>
            <div className="order-grid">
              {visibleBookings.map((booking) => {
                const product = products.find((item) => item.productId === booking.productId);
                return (
                  <article key={booking._id}>
                    <img src={productPhoto(product?.name, booking.productId)} alt="" />
                    <div>
                      <small>BOOKING ID</small>
                      <b>{booking.bookingId}</b>
                      <span>
                        {booking.productId} · {booking.requiredQuantity} units
                      </span>
                      <em>Cash on Delivery</em>
                    </div>
                    <div className="order-status">
                      <em className={`badge ${booking.status.toLowerCase()}`}>{booking.status}</em>
                      <small>Booking is being processed</small>
                    </div>
                  </article>
                );
              })}
            </div>
            <Pagination page={bookingPage} setPage={setBookingPage} count={bookings.length} />
          </section>
        )}
      </main>
      {drawer === 'wishlist' && (
        <Drawer title="Wishlist" onClose={() => setDrawer('')}>
          {products
            .filter((product) => wishlist.includes(product.productId))
            .map((product) => (
              <article className="drawer-item" key={product.productId}>
                <img src={productPhoto(product.name, product.productId)} alt="" />
                <div>
                  <b>{product.name}</b>
                  <small>{product.productId}</small>
                  <button className="secondary" onClick={() => moveToCart(product.productId)}>
                    Move to cart
                  </button>
                </div>
                <button className="remove" onClick={() => toggleWishlist(product.productId)}>
                  ×
                </button>
              </article>
            ))}
        </Drawer>
      )}
      {drawer === 'cart' && (
        <Drawer title="Shopping cart" onClose={() => setDrawer('')}>
          {cartItems.map((item) => (
            <article className="drawer-item" key={item.productId}>
              <img src={productPhoto(item.product.name, item.product.productId)} alt="" />
              <div>
                <b>{item.product.name}</b>
                <small>Quantity: {item.quantity}</small>
                <span>₹{productPrice(item.product).toLocaleString('en-IN')}</span>
              </div>
              <button
                className="remove"
                onClick={() =>
                  setCart((items) => items.filter((entry) => entry.productId !== item.productId))
                }
              >
                ×
              </button>
            </article>
          ))}
          <footer>
            <div>
              <span>Total</span>
              <b>₹{total.toLocaleString('en-IN')}</b>
            </div>
            <button disabled={!cartItems.length} onClick={checkout}>
              Checkout · Cash on delivery
            </button>
          </footer>
        </Drawer>
      )}
    </div>
  );
}
