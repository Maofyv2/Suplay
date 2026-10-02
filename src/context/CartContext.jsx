import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'suplay_cart';

const getMinimumQuantity = (product) => Math.max(1, Math.floor(Number(product.moq) || 1));
const getMaximumQuantity = (product) => (
  product.stock === undefined || product.stock === null
    ? Number.MAX_SAFE_INTEGER
    : Math.max(0, Math.floor(Number(product.stock) || 0))
);

function getStoredCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse cart from localStorage:', e);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(getStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  const addToCart = useCallback((product, qty) => {
    const minQty = getMinimumQuantity(product);
    const maxQty = getMaximumQuantity(product);
    if (maxQty < minQty) return;
    const requestedQty = Math.min(maxQty, Math.max(minQty, Math.floor(Number(qty) || minQty)));

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => String(i.productId) === String(product.id));
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(maxQty, Math.max(minQty, existing.qty) + requestedQty);
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          qty: newQty,
          stock: product.stock !== undefined ? product.stock : existing.stock,
          moq: product.moq !== undefined ? product.moq : existing.moq,
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          supplierId: product.supplierId,
          supplierName: product.supplierName || 'Supplier',
          image: product.image || null,
          moq: minQty,
          stock: product.stock !== undefined ? product.stock : undefined,
          qty: requestedQty,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((productId, newQty) => {
    if (newQty <= 0) {
      setItems((prev) => prev.filter((i) => String(i.productId) !== String(productId)));
    } else {
      setItems((prev) =>
        prev.map((item) => {
          if (String(item.productId) === String(productId)) {
            const minQty = getMinimumQuantity(item);
            const maxQty = getMaximumQuantity(item);
            if (maxQty < minQty) return item;
            const quantity = Math.floor(Number(newQty) || minQty);
            return { ...item, qty: Math.min(maxQty, Math.max(minQty, quantity)) };
          }
          return item;
        })
      );
    }
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => String(i.productId) !== String(productId)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);

  const value = {
    items,
    cartTotal,
    cartCount,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export default CartContext;
