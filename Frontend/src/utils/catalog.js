export const PAGE_SIZE = 10;

const productImages = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=700&q=80',
];

const imageKeyByName = new Map();
const imageIndex = (key) => {
  const number = Number(String(key).match(/\d+$/)?.[0]);
  if (Number.isFinite(number)) return (number - 1 + productImages.length) % productImages.length;
  return [...String(key)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % productImages.length;
};

// A Product ID is permanent. Mapping a name to it also keeps Cart/Wishlist rows
// consistent because those screens only receive a product name in some places.
export const productPhoto = (name = '', productId) => {
  const stableKey = productId || imageKeyByName.get(name) || name;
  if (productId) imageKeyByName.set(name, productId);
  return productImages[imageIndex(stableKey)];
};

export const productPrice = (productOrId) => {
  if (typeof productOrId === 'object' && Number.isFinite(Number(productOrId?.price)))
    return Number(productOrId.price);
  return 0;
};
export const matchesSearch = (item, term) => {
  const normalise = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  const query = normalise(term);
  return (
    !query ||
    normalise(`${item.name || item.productName || ''}${item.productId || ''}`).includes(query)
  );
};
