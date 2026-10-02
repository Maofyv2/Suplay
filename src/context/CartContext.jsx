import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'suplay_cart';

// Quantities must always be even numbers
const toEven = (n) => (n % 2 === 0 ? n : n + 1);

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

  const addToCart = useCallback((product, qty = 2) => {
    const minQty = toEven(Math.max(2, product.moq || 2));
    const requestedQty = toEven(Math.max(minQty, Number(qty) || 2));

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => String(i.productId) === String(product.id));
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const rawNewQty = existing.qty + requestedQty;
        const maxEven = product.stock !== undefined
          ? (product.stock % 2 === 0 ? product.stock : product.stock - 1)
          : 9998;
        const newQty = toEven(Math.min(maxEven, rawNewQty));
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          qty: newQty,
          stock: product.stock !== undefined ? product.stock : existing.stock,
          moq: product.moq !== undefined ? product.moq : existing.moq,
        };
        return updated;
      }

      const maxEven = product.stock !== undefined
        ? (product.stock % 2 === 0 ? product.stock : product.stock - 1)
        : 9998;
      const initialQty = toEven(Math.min(maxEven, requestedQty));
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit || 'piece',
          supplierId: product.supplierId,
          supplierName: product.supplierName || 'Supplier',
          image: product.image || null,
          moq: product.moq || 2,
          stock: product.stock !== undefined ? product.stock : 999,
          qty: initialQty,
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
            const maxEven = item.stock
              ? (item.stock % 2 === 0 ? item.stock : item.stock - 1)
              : 9998;
            const cappedQty = toEven(Math.min(maxEven, Math.max(2, newQty)));
            return { ...item, qty: cappedQty };
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

