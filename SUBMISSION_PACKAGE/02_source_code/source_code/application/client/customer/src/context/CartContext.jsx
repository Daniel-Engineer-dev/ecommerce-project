import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem('cart');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (voucher) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.voucher_id === voucher.voucher_id);
      const stock = Number(voucher.quantity_stock || existing?.quantity_stock || 1);
      if (existing) {
        return prev.map(item =>
          item.voucher_id === voucher.voucher_id
            ? { ...item, quantity: Math.min(stock, item.quantity + 1), quantity_stock: stock }
            : item
        );
      }
      return [...prev, { ...voucher, quantity: 1, quantity_stock: stock }];
    });
  };

  const removeFromCart = (voucherId) => {
    setCartItems(prev => prev.filter(item => item.voucher_id !== voucherId));
  };

  const updateQuantity = (voucherId, quantity) => {
    if (quantity < 1) {
      removeFromCart(voucherId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.voucher_id === voucherId
          ? { ...item, quantity: Math.min(Number(item.quantity_stock || quantity), quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (parseFloat(item.sale_price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
