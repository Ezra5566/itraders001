'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productApi, categoryApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Package, Plus, Search, Filter, Edit, Trash2,
  Eye, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  status: 'draft' | 'active' | 'archived';
  isActive: boolean;
  category: { name: string; _id?: string };
  images: Array<{ url: string; alt?: string }> | string[];
  brand?: string;
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, lowStock: 0 });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [isAdmin, currentPage, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await productApi.getProducts(params);
      const data = response.data.data;

      setProducts(data.products || data);
      setTotalPages(data.pagination?.pages || 1);

      // Calculate stats
      const allProducts = data.products || data;
      setStats({
        total: allProducts.length,
        active: allProducts.filter((p: Product) => p.status === 'active').length,
        lowStock: allProducts.filter((p: Product) => p.inventory < 10).length,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productApi.delete(id);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      await productApi.update(product._id, { isActive: !product.isActive });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!isAdmin) return null;

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metallic-50">
      {/* Header */}
      <div className="bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Products</h1>
              <p className="text-metallic-400 mt-1">Manage your product catalog</p>
            </div>
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-metallic-500">Total Products</p>
                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-metallic-500">Active Products</p>
                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <ToggleRight className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-metallic-500">Low Stock</p>
                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.lowStock}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <Package className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-metallic-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-metallic-50 border-b border-metallic-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-dark-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-metallic-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-metallic-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-metallic-100 rounded-lg overflow-hidden">
                          {product.images?.[0] ? (
                            <img
                              src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-metallic-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark-900">{product.name}</p>
                          <p className="text-sm text-metallic-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-metallic-600">
                      {product.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-dark-900">{formatPrice(product.price)}</p>
                        {product.compareAtPrice && (
                          <p className="text-sm text-metallic-500 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${product.inventory < 10
                        ? 'bg-red-100 text-red-700'
                        : product.inventory < 50
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                        }`}>
                        {product.inventory} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(product)}
                        className="flex items-center gap-1"
                      >
                        {product.isActive ? (
                          <ToggleRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-metallic-400" />
                        )}
                        <span className={`text-sm ${product.isActive ? 'text-green-600' : 'text-metallic-500'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="p-2 text-metallic-600 hover:bg-metallic-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-metallic-200 flex items-center justify-between">
              <p className="text-sm text-metallic-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-metallic-200 rounded-lg hover:bg-metallic-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-metallic-200 rounded-lg hover:bg-metallic-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
