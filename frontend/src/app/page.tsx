'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productApi, categoryApi } from '@/lib/api';
import { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ArrowRight, Star, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productApi.getFeatured(8),
          categoryApi.getCategories(),
        ]);
        setFeaturedProducts(productsRes.data.data.products);
        setCategories(categoriesRes.data.data.categories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    { icon: Truck, title: 'Free Shipping', description: 'On orders over KES 5,000' },
    { icon: Shield, title: 'Authentic Products', description: '100% genuine with warranty' },
    { icon: RotateCcw, title: 'Easy Returns', description: '14-day return policy' },
    { icon: Headphones, title: '24/7 Support', description: 'Expert assistance always' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium mb-6">
                New Arrivals
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Premium Electronics
                <span className="block gradient-text">For Everyone</span>
              </h1>
              <p className="text-lg text-metallic-300 mb-8 max-w-lg">
                Discover the latest Apple and Samsung products at unbeatable prices. 
                Authentic devices with official warranty.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/category/iphone">
                  <Button size="lg" className="gap-2">
                    Shop Now
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link href="/category/samsung-phones">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    View Samsung
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative h-[500px] w-full bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl font-bold gradient-text">ITraders</span>
                  <p className="text-metallic-300 mt-4 text-xl">Premium Tech Store</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </section>

      {/* Features Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-metallic-50"
            >
              <div className="p-3 bg-primary-600/10 rounded-lg">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-900">{feature.title}</h3>
                <p className="text-sm text-metallic-500">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-dark-900">Shop by Category</h2>
          <Link href="/categories" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 4).map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={`/category/${category.slug}`}
                className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 aspect-square"
              >
                <div className="absolute inset-0 bg-primary-600/10 group-hover:bg-primary-600/20 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-white font-bold text-xl mb-2">{category.name}</h3>
                  <p className="text-metallic-400 text-sm">{category.description}</p>
                  <span className="mt-4 inline-flex items-center text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight size={16} className="ml-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-dark-900">Featured Products</h2>
            <p className="text-metallic-500 mt-1">Handpicked premium devices for you</p>
          </div>
          <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brand Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-purple-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Apple & Samsung Authorized</h2>
              <p className="text-metallic-300 max-w-lg">
                We are an authorized reseller. All products come with official warranty 
                and genuine accessories.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-3 bg-white/10 backdrop-blur rounded-xl text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-xs text-metallic-300">Authentic</div>
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur rounded-xl text-center">
                <div className="text-2xl font-bold">1 Year</div>
                <div className="text-xs text-metallic-300">Warranty</div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="product-card bg-white rounded-2xl border border-metallic-100 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square bg-metallic-50 image-zoom">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-metallic-100 to-metallic-200">
              <span className="text-metallic-400 text-4xl font-bold">{product.brand}</span>
            </div>
          )}
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discountPercentage}%
            </span>
          )}
          {product.brand === 'Apple' && (
            <span className="absolute top-3 right-3 bg-dark-900/80 text-white text-xs px-2 py-1 rounded">
              Apple
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-dark-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-metallic-500 mt-1 line-clamp-1">{product.shortDescription}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating?.average || 0}</span>
            <span className="text-sm text-metallic-400">({product.rating?.count || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-metallic-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
