"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  addItem as addItemPure,
  removeItem as removeItemPure,
  updateQty as updateQtyPure,
  clearCart as clearCartPure,
  computeSubtotal,
  computeServiceFee,
  computeTotal,
  loadCart,
  saveCart,
} from "./cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration-safe: baca localStorage hanya setelah mount di client
  useEffect(() => {
    setItems(loadCart());
    setIsHydrated(true);
  }, []);

  // Persist ke localStorage setiap kali items berubah (kecuali saat hydration pertama)
  useEffect(() => {
    if (isHydrated) {
      saveCart(items);
    }
  }, [items, isHydrated]);

  const addItem = (product, qty = 1) => {
    setItems((current) => addItemPure(current, product, qty));
  };

  const removeItem = (productId) => {
    setItems((current) => removeItemPure(current, productId));
  };

  const updateQty = (productId, qty) => {
    setItems((current) => updateQtyPure(current, productId, qty));
  };

  const clearCart = () => {
    setItems(clearCartPure());
  };

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = computeSubtotal(items);
  const serviceFee = computeServiceFee(subtotal);
  const total = subtotal + serviceFee;

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        subtotal,
        serviceFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus dipakai di dalam CartProvider");
  }
  return context;
}
