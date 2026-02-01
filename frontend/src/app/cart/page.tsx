'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, items, subtotal, total, itemCount, isLoading, fetchCart, updateCartItem, removeFromCart, applyCoupon, removeCoupon } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast.success('Item removed from cart');
  };

  const handleApplyCoupon = () => {
    const code = prompt('Enter coupon code:');
    if (code) {
      applyCoupon(code);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-metallic-50 flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-metallic-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Please Sign In</h2>
          <p className="text-metallic-500 mb-6">Sign in to view your cart and continue shopping</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-metallic-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-metallic-50 flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-metallic-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Your Cart is Empty</h2>
          <p className="text-metallic-500 mb-6">Looks like you have not added any items yet</p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metallic-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-8">Shopping Cart ({itemCount} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl p-4 flex gap-4 shadow-sm"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0 bg-metallic-50 rounded-lg overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-metallic-400">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <Link href={`/product/${(item.product as any).slug}`}>
                    <h3 className="font-semibold text-dark-900 hover:text-primary-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-metallic-500">SKU: {item.sku}</p>
                  <p className="text-primary-600 font-semibold mt-1">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-metallic-200 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="p-2 hover:bg-metallic-50 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="p-2 hover:bg-metallic-50 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="font-bold text-dark-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-dark-900 mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-4">
                {cart?.coupon ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-green-600" />
                      <span className="text-green-700 font-medium">{cart.coupon.code}</span>
                    </div>
                    <button
                      onClick={() => removeCoupon()}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-metallic-300 rounded-lg text-metallic-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <Tag size={18} />
                    Apply Coupon Code
                  </button>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-metallic-100 pt-4">
                <div className="flex justify-between text-metallic-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-metallic-600">
                  <span>Shipping</span>
                  <span className={subtotal > 5000 ? 'text-green-600' : ''}>
                    {subtotal > 5000 ? 'FREE' : 'Calculated at checkout'}
                  </span>
                </div>
                {cart?.coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(subtotal - total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-dark-900 pt-3 border-t border-metallic-100">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-6 gap-2" size="lg">
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </Button>
              </Link>

              <p className="text-center text-sm text-metallic-500 mt-4">
                Free shipping on orders over {formatPrice(5000)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
