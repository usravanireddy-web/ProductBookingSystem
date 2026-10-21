import { useState } from "react";
import { PAGE_SIZE, productPhoto, productPrice } from "../utils/catalog";

export function PasswordInput({ value, onChange, minLength }) {
  const [visible, setVisible] = useState(false);
  return <span className="password-field"><input type={visible ? "text" : "password"} value={value} onChange={onChange} minLength={minLength} required /><button className="eye-button" type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.3 4 9.4 6.1a1.9 1.9 0 0 1 0 1.8 16.5 16.5 0 0 1-3.1 3.8M6.6 6.6A16.5 16.5 0 0 0 2.6 10a1.9 1.9 0 0 0 0 1.8C3.7 14 7 18 12 18c1.2 0 2.3-.2 3.3-.6" /></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.6 10.1C3.7 8 7 4 12 4s8.3 4 9.4 6.1a1.9 1.9 0 0 1 0 1.8C20.3 14 17 18 12 18s-8.3-4-9.4-6.1a1.9 1.9 0 0 1 0-1.8Z" /><circle cx="12" cy="11" r="3" /></svg>}</button></span>;
}

export function Pagination({ page, setPage, count }) {
  const pages = Math.ceil(count / PAGE_SIZE);
  if (pages <= 1) return null;
  return <nav className="pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button></nav>;
}

export function SearchInput({ value, onChange, placeholder }) {
  return <label className="search-box"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg><input className="search-input" placeholder={placeholder} value={value} onChange={onChange} /></label>;
}

export function ProductCard({ product, wished = false, onWish = () => {}, onCart = () => {}, onOpen = () => {} }) {
  return <article className="product-card shop-card"><div className="product-picture"
  ><button className="image-button" onClick={() => onOpen(product)}>
    <img src={productPhoto(product.name)} alt={product.name} /></button>
    <button className="wish-toggle" onClick={() => onWish(product.productId)}>{wished ? "♥" : "♡"}</button></div>
    <div>
      <small>{product.productId}</small>
      <button className="product-title" onClick={() => onOpen(product)}>
        <h3>{product.name}</h3>
        </button>
        <b className="product-price">₹{productPrice(product.productId).toLocaleString("en-IN")}</b>
        <button className="secondary card-action" onClick={() => onCart(product.productId)}>Add to cart</button>
        </div>
        </article>;
}
