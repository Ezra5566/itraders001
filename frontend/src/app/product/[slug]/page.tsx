'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Star, Heart, Share2, Truck, Shield, RotateCcw, Check, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productApi.getProduct(params.slug as string);
        setProduct(response.data.data.product);
        setRelatedProducts(response.data.data.relatedProducts);
      } catch (error) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product._id, quantity);
    toast.success('Added to cart!');
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Product Not Found</h1>
          <p className="text-metallic-500 mb-4">The product you are looking for does not exist.</p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-metallic-50 border-b border-metallic-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-metallic-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight size={16} />
            <Link href={`/category/${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
            <ChevronRight size={16} />
            <span className="text-dark-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-metallic-50 rounded-2xl overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]?.url || product.primaryImage || ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-metallic-100 to-metallic-200">
                  <span className="text-4xl font-bold text-metallic-400">{product.brand}</span>
                </div>
              )}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === index ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                  {product.brand}
                </span>
                {product.inventory > 0 ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Check size={16} /> In Stock
                  </span>
                ) : (
                  <span className="text-red-500 text-sm">Out of Stock</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-dark-900">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < (product.rating?.average || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-metallic-300'}
                    />
                  ))}
                </div>
                <span className="text-metallic-500">
                  {product.rating?.average || 0} ({product.rating?.count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-xl text-metallic-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="text-green-600 font-medium">
                    Save {formatPrice(product.comparePrice - product.price)}
                  </span>
                </>
              )}
            </div>

            <p className="text-metallic-600 leading-relaxed">{product.description}</p>

            {/* Short Description */}
            {product.shortDescription && (
              <div className="p-4 bg-metallic-50 rounded-xl">
                <p className="text-sm text-metallic-600">{product.shortDescription}</p>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-dark-900">Quantity:</span>
              <div className="flex items-center border border-metallic-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-metallic-50 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-metallic-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                className="flex-1 gap-2"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.inventory === 0}
              >
                Add to Cart
              </Button>
              <button
                onClick={handleWishlist}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  isWishlisted
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-metallic-200 text-metallic-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={isWishlisted ? 'fill-current' : ''} size={24} />
              </button>
              <button className="p-4 rounded-lg border-2 border-metallic-200 text-metallic-600 hover:border-primary-500 hover:text-primary-600 transition-colors">
                <Share2 size={24} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-metallic-100">
              <div className="text-center">
                <Truck className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-xs text-metallic-600">Free Shipping over KES 5,000</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-xs text-metallic-600">{product.warranty?.duration || 12} Month Warranty</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-xs text-metallic-600">14-Day Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-dark-900 mb-6">Specifications</h2>
            <div className="bg-metallic-50 rounded-xl overflow-hidden">
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  className={`flex justify-between p-4 ${
                    index !== product.specifications!.length - 1 ? 'border-b border-metallic-200' : ''
                  }`}
                >
                  <span className="text-metallic-600">{spec.name}</span>
                  <span className="font-medium text-dark-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
