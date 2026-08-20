import {
  useMemo,
  useState,
} from "react";

import { CartContext } from "./cart-context";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    if (!product || quantity <= 0) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) => {
          if (item.id !== product.id) {
            return item;
          }

          const stock = Number(product.stock || 0);

          const newQuantity =
            existingItem.quantity + Number(quantity);

          return {
            ...item,
            quantity:
              stock > 0
                ? Math.min(newQuantity, stock)
                : newQuantity,
          };
        });
      }

      const stock = Number(product.stock || 0);

      const safeQuantity =
        stock > 0
          ? Math.min(Number(quantity), stock)
          : Number(quantity);

      return [
        ...currentItems,
        {
          ...product,
          quantity: safeQuantity,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== productId
      )
    );
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const stock = Number(item.stock || 0);

        const safeQuantity = Math.max(
          1,
          Number(quantity)
        );

        return {
          ...item,
          quantity:
            stock > 0
              ? Math.min(safeQuantity, stock)
              : safeQuantity,
        };
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const regularPrice = Number(
        item.price || 0
      );

      const salePrice = Number(
        item.sale_price || 0
      );

      const finalPrice =
        salePrice > 0 &&
        regularPrice > 0 &&
        salePrice < regularPrice
          ? salePrice
          : regularPrice;

      return (
        total +
        finalPrice * Number(item.quantity)
      );
    }, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}