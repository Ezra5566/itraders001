import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartApi } from '@/lib/api';
import { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  total: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response.data.data.cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string }, { rejectWithValue }) => {
    try {
      const response = await cartApi.addItem(productId, quantity, variantId);
      return response.data.data.cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateQuantity(itemId, quantity);
      return response.data.data.cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeItem(itemId);
      return response.data.data.cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.clear();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await cartApi.applyCoupon(code);
      return response.data.data.cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.itemCount = action.payload?.itemCount || 0;
        state.subtotal = action.payload?.subtotal || 0;
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.itemCount = action.payload?.itemCount || 0;
        state.subtotal = action.payload?.subtotal || 0;
        state.total = action.payload?.total || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Cart Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.itemCount = action.payload?.itemCount || 0;
        state.subtotal = action.payload?.subtotal || 0;
        state.total = action.payload?.total || 0;
      })
      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.itemCount = action.payload?.itemCount || 0;
        state.subtotal = action.payload?.subtotal || 0;
        state.total = action.payload?.total || 0;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
        state.items = [];
        state.itemCount = 0;
        state.subtotal = 0;
        state.total = 0;
      })
      // Apply Coupon
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.total = action.payload?.total || 0;
      });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
