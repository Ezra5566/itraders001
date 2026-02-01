'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { categoryApi } from '@/lib/api';
import { Category, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Star, ChevronRight, SlidersHorizontal } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

export default function CategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    const fetchCategory = async () => {
      // Guard against undefined slug
      if (!params.slug) return;
      
      try {
        const response = await categoryApi.getCategory(params.slug as string, {
          sort: sortBy,
        });
        setCategory(response.data.data.category);
        setProducts(response.data.data.products);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params.slug, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Category Not Found</h1>
          <p className="text-metallic-500 mb-4">The category you are looking for does not exist.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metallic-50">
      {/* Breadcrumb & Header */}
      <div className="bg-white border-b border-metallic-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-metallic-500 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight size={16} />
            <span className="text-dark-900">{category.name}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-dark-900">{category.name}</h1>
              <p className="text-metallic-500 mt-1">{category.description}</p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-metallic-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating.average">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <SlidersHorizontal className="w-16 h-16 text-metallic-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-dark-900 mb-2">No Products Found</h2>
            <p className="text-metallic-500">Products will be added to this category soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-square bg-metallic-50 overflow-hidden">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-metallic-100 to-metallic-200">
              <span className="text-3xl font-bold text-metallic-400">{product.brand}</span>
            </div>
          )}
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discountPercentage}%
            </span>
          )}
        </div>
        <div className="p-4">
          <span className="text-xs text-primary-600 font-medium">{product.brand}</span>
          <h3 className="font-semibold text-dark-900 group-hover:text-primary-600 transition-colors line-clamp-1 mt-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{product.rating?.average || 0}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-primary-600">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-metallic-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
