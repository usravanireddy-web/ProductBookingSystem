import { productPhoto, productPrice } from '../../utils/catalog';

export function ProductCard({
  product,
  wished = false,
  onWish = () => {},
  onCart = () => {},
  onOpen = () => {},
  admin = false,
}) {
  return (
    <article className="product-card shop-card">
      <div className="product-picture">
        <button className="image-button" onClick={() => !admin && onOpen(product)}>
          <img src={productPhoto(product.name, product.productId)} alt={product.name} />
        </button>
        {!admin && (
          <button className="wish-toggle" onClick={() => onWish(product.productId)}>
            {wished ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div>
        <small>{product.productId}</small>
        <button className="product-title" onClick={() => !admin && onOpen(product)}>
          <h3>{product.name}</h3>
        </button>
        <b className="product-price">₹{productPrice(product).toLocaleString('en-IN')}</b>
        {!admin && (
          <button className="secondary card-action" onClick={() => onCart(product.productId)}>
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}
