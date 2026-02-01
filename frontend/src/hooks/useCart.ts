'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  clearCartError,
} from '@/store/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, items, itemCount, subtotal, total, isLoading, error } = useSelector(
    (state: RootState) => state.cart
  );

  return {
    cart,
    items,
    itemCount,
    subtotal,
    total,
    isLoading,
    error,
    fetchCart: () => dispatch(fetchCart()),
    addToCart: (productId: string, quantity: number, variantId?: string) =>
      dispatch(addToCart({ productId, quantity, variantId })),
    updateCartItem: (itemId: string, quantity: number) =>
      dispatch(updateCartItem({ itemId, quantity })),
    removeFromCart: (itemId: string) => dispatch(removeFromCart(itemId)),
    clearCart: () => dispatch(clearCart()),
    applyCoupon: (code: string) => dispatch(applyCoupon(code)),
    clearError: () => dispatch(clearCartError()),
  };
};
