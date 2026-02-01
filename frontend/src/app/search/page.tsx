'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Search, Filter, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: Array<{ url: string; alt?: string }>;
    rating: {
        average: number;
        count: number;
    };
    category: {
        name: string;
        slug: string;
    };
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(query);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        if (query) {
            setSearchTerm(query);
            performSearch(query, 1);
        }
    }, [query]);

    const performSearch = async (searchQuery: string, page: number = 1) => {
        if (!searchQuery.trim()) {
            setProducts([]);
            return;
        }

        try {
            setLoading(true);
            const response = await productApi.search(searchQuery, { page, limit: 12 });
            const data = response.data.data;

            setProducts(data.products || []);
            setTotalPages(data.pagination?.pages || 1);
            setTotalResults(data.pagination?.total || 0);
            setCurrentPage(page);
        } catch (error) {
            console.error('Search error:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setProducts([]);
        router.push('/search');
    };

    return (
        <div className="min-h-screen bg-metallic-50">
            {/* Search Header */}
            <div className="bg-dark-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-6">Search Products</h1>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="max-w-3xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-metallic-400" size={24} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for products..."
                                className="w-full pl-14 pr-24 py-4 rounded-lg text-dark-900 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-20 top-1/2 -translate-y-1/2 p-2 text-metallic-400 hover:text-dark-900"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Search Results Info */}
                    {query && (
                        <div className="mt-4 text-metallic-300">
                            {loading ? (
                                <p>Searching...</p>
                            ) : (
                                <p>
                                    {totalResults > 0
                                        ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
                                        : `No results found for "${query}"`
                                    }
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : products.length > 0 ? (
                    <>
                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product._id}
                                    href={`/product/${product.slug}`}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square bg-metallic-100 relative overflow-hidden">
                                        {product.images && product.images.length > 0 ? (
                                            <Image
                                                src={product.images[0].url}
                                                alt={product.images[0].alt || product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-metallic-400">
                                                No Image
                                            </div>
                                        )}

                                        {/* Discount Badge */}
                                        {product.comparePrice && product.comparePrice > product.price && (
                                            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                                                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        {/* Category */}
                                        <p className="text-xs text-metallic-500 mb-1">{product.category?.name}</p>

                                        {/* Product Name */}
                                        <h3 className="font-semibold text-dark-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                            {product.name}
                                        </h3>

                                        {/* Rating */}
                                        {product.rating && product.rating.count > 0 && (
                                            <div className="flex items-center gap-1 mb-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-sm ${i < Math.round(product.rating.average)
                                                                    ? 'text-yellow-400'
                                                                    : 'text-metallic-300'
                                                                }`}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-metallic-500">
                                                    ({product.rating.count})
                                                </span>
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="flex items-center gap-2">
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
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                <button
                                    onClick={() => performSearch(query, currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-metallic-300 rounded-lg hover:bg-metallic-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <div className="flex gap-2">
                                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => performSearch(query, pageNum)}
                                                className={`px-4 py-2 rounded-lg ${currentPage === pageNum
                                                        ? 'bg-primary-600 text-white'
                                                        : 'border border-metallic-300 hover:bg-metallic-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => performSearch(query, currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-metallic-300 rounded-lg hover:bg-metallic-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : query ? (
                    <div className="text-center py-20">
                        <Search className="mx-auto mb-4 text-metallic-300" size={64} />
                        <h2 className="text-2xl font-bold text-dark-900 mb-2">No results found</h2>
                        <p className="text-metallic-600 mb-6">
                            Try different keywords or browse our categories
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Search className="mx-auto mb-4 text-metallic-300" size={64} />
                        <h2 className="text-2xl font-bold text-dark-900 mb-2">Start searching</h2>
                        <p className="text-metallic-600">
                            Enter a search term above to find products
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
