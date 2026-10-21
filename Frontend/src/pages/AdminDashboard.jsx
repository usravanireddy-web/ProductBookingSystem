import { useEffect, useMemo, useState } from 'react';
import { Pagination } from '../components/navigation/Pagination';
import { ProductCard } from '../components/catalog/ProductCard';
import { SearchInput } from '../components/search/SearchInput';
import { matchesSearch, PAGE_SIZE } from '../utils/catalog';

function EditProductDialog({ product, quantity, onClose, onSave }) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price ?? 0);
  const [stockQuantity, setStockQuantity] = useState(quantity ?? 0);
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(name, Number(price), Number(stockQuantity));
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="drawer-overlay edit-overlay" onClick={onClose}>
      <section className="edit-dialog" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p className="eyebrow">EDIT PRODUCT</p>
            <h2>{product.productId}</h2>
          </div>
          <button className="icon-close" onClick={onClose}>
            ×
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            Product name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>
          <label>
            Available quantity
            <input
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              required
            />
          </label>
          <div className="edit-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function AdminDashboard({
  user,
  products,
  bookings,
  stock,
  refresh,
  createProduct,
  updateProduct,
  deleteProduct,
  addStockQuantity,
  allocate,
  manufacture,
  logout,
}) {
  const [tab, setTab] = useState('overview'),
    [term, setTerm] = useState(''),
    [page, setPage] = useState(1),
    [error, setError] = useState(''),
    [editing, setEditing] = useState(null);
  const [name, setName] = useState(''),
    [price, setPrice] = useState(''),
    [initialQuantity, setInitialQuantity] = useState(''),
    [stockProductId, setStockProductId] = useState(''),
    [stockQuantity, setStockQuantity] = useState('');
  useEffect(() => {
    refresh().catch((error) => setError(error.message));
  }, []);
  useEffect(() => setPage(1), [tab, term]);
  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(''), 2500);
    return () => clearTimeout(timer);
  }, [error]);
  const filteredProducts = useMemo(
    () => products.filter((product) => matchesSearch(product, term)),
    [products, term],
  );
  const filteredStock = useMemo(
    () => stock.filter((item) => matchesSearch(item, term)),
    [stock, term],
  );
  const actionBookings = bookings.filter((booking) => booking.status !== 'Complete');
  const shownActions = actionBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const shownProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const shownStock = filteredStock.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const names = Object.fromEntries(products.map((product) => [product.productId, product.name]));
  const allocateBooking = async (booking) => {
    const quantity = Number(
      prompt(
        `Allocate quantity, maximum ${booking.requiredQuantity - booking.allocatedQuantity}`,
        booking.requiredQuantity - booking.allocatedQuantity,
      ),
    );
    if (!quantity) return;
    try {
      await allocate(booking._id, quantity);
    } catch (error) {
      setError(error.message);
    }
  };
  const saveEdit = async (productName, productPrice, quantity) => {
    try {
      await updateProduct(editing._id, productName, productPrice, quantity);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  const remove = async (product) => {
    if (!confirm(`Delete ${product.name}?`)) return;
    try {
      await deleteProduct(product._id);
    } catch (error) {
      setError(error.message);
    }
  };
  const newProduct = async (event) => {
    event.preventDefault();
    try {
      await createProduct(name, Number(price), Number(initialQuantity));
      setName('');
      setPrice('');
      setInitialQuantity('');
    } catch (error) {
      setError(error.message);
    }
  };
  const restock = async (event) => {
    event.preventDefault();
    try {
      await addStockQuantity(stockProductId, Number(stockQuantity));
      setStockQuantity('');
    } catch (error) {
      setError(error.message);
    }
  };
  const editingQuantity = editing
    ? (stock.find((item) => item.productId === editing.productId)?.quantity ?? 0)
    : 0;
  return (
    <div className="app-shell">
      <aside>
        <div className="brand">
          BOOK<span>FLOW</span>
        </div>
        <p className="workspace">ADMIN WORKSPACE</p>
        <nav>
          {['overview', 'products', 'inventory'].map((item) => (
            <button
              key={item}
              className={tab === item ? 'active' : ''}
              onClick={() => setTab(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
        <div className="side-user">
          <b>{user.username}</b>
          <small>Administrator</small>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dash-header">
          <div>
            <p className="eyebrow">ADMIN DASHBOARD</p>
            <h1>{tab[0].toUpperCase() + tab.slice(1)}</h1>
          </div>
          {tab !== 'overview' && (
            <SearchInput
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={`Search ${tab}`}
            />
          )}
        </header>
        {error && <p className="error">{error}</p>}
        {tab === 'overview' && (
          <>
            <section className="stat-grid">
              {[
                ['Products', products.length],
                ['Open bookings', bookings.filter((booking) => booking.status === 'Open').length],
                ['Units in stock', stock.reduce((sum, item) => sum + item.quantity, 0)],
                ['Completed', bookings.filter((booking) => booking.status === 'Complete').length],
              ].map((item) => (
                <article key={item[0]}>
                  <b>{item[1]}</b>
                  <small>{item[0]}</small>
                </article>
              ))}
            </section>
            <section className="recent">
              <h2>Production actions</h2>
              {shownActions.map((booking) => (
                <div className="recent-row" key={booking._id}>
                  <span>{booking.bookingId}</span>
                  <b>
                    {names[booking.productId] || booking.productId}
                    <small>{booking.productId}</small>
                  </b>
                  <small>
                    {booking.allocatedQuantity}/{booking.requiredQuantity} units
                  </small>
                  {booking.status === 'Open' ? (
                    <button className="secondary" onClick={() => allocateBooking(booking)}>
                      Allocate
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        manufacture(booking._id).catch((error) => setError(error.message))
                      }
                    >
                      Manufacture
                    </button>
                  )}
                </div>
              ))}
              <Pagination page={page} setPage={setPage} count={actionBookings.length} />
            </section>
          </>
        )}
        {tab === 'products' && (
          <section>
            <div className="section-heading">
              <h2>Product catalog</h2>
              <span>{filteredProducts.length} items</span>
            </div>
            <div className="catalog">
              {shownProducts.map((product) => (
                <div className="admin-product" key={product._id}>
                  <ProductCard product={product} admin />
                  <div className="admin-product-actions">
                    <button className="secondary" onClick={() => setEditing(product)}>
                      Edit
                    </button>
                    <button className="danger" onClick={() => remove(product)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} setPage={setPage} count={filteredProducts.length} />
          </section>
        )}
        {tab === 'inventory' && (
          <section className="booking-layout">
            <div className="panel">
              <h2>Add product to inventory</h2>
              <form onSubmit={newProduct}>
                <label>
                  Product name
                  <input value={name} onChange={(event) => setName(event.target.value)} required />
                </label>
                <label>
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Initial quantity
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={initialQuantity}
                    onChange={(event) => setInitialQuantity(event.target.value)}
                    required
                  />
                </label>
                <button>Add product</button>
              </form>
              <hr />
              <h2>Restock product</h2>
              <form onSubmit={restock}>
                <label>
                  Product
                  <select
                    value={stockProductId}
                    onChange={(event) => setStockProductId(event.target.value)}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.name} · {product.productId}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantity to add
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                    required
                  />
                </label>
                <button>Add stock quantity</button>
              </form>
            </div>
            <div className="panel">
              <h2>Inventory</h2>
              {shownStock.map((item) => (
                <div className="inventory-item" key={item.productId}>
                  <span>
                    {item.productName}
                    <small>{item.productId}</small>
                  </span>
                  <b>{item.quantity}</b>
                </div>
              ))}
              <Pagination page={page} setPage={setPage} count={filteredStock.length} />
            </div>
          </section>
        )}
      </main>
      {editing && (
        <EditProductDialog
          product={editing}
          quantity={editingQuantity}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}
