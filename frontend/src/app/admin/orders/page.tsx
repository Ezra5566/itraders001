'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { orderApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    ShoppingCart, Search, Filter, Eye, Download,
    ChevronLeft, ChevronRight, TrendingUp, DollarSign, Package
} from 'lucide-react';
import Link from 'next/link';

interface Order {
    _id: string;
    orderNumber: string;
    customer: { firstName: string; lastName: string; email: string };
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: any[];
}

export default function OrdersPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        revenue: 0,
        thisMonth: 0
    });

    useEffect(() => {
        if (!isAdmin) {
            router.push('/');
            return;
        }
        fetchOrders();
    }, [isAdmin, currentPage, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params: any = { page: currentPage, limit: 10 };
            if (statusFilter) params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            const response = await orderApi.getAllOrders(params);
            const data = response.data.data;

            setOrders(data.orders || data);
            setTotalPages(data.totalPages || 1);

            // Calculate stats
            const allOrders = data.orders || data;
            const totalRevenue = allOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
            const pendingCount = allOrders.filter((o: Order) => o.status === 'pending').length;

            setStats({
                total: allOrders.length,
                pending: pendingCount,
                revenue: totalRevenue,
                thisMonth: allOrders.length,
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchOrders();
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            processing: 'bg-blue-100 text-blue-700',
            shipped: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    if (!isAdmin) return null;

    if (loading && orders.length === 0) {
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
                            <h1 className="text-2xl font-bold">Orders</h1>
                            <p className="text-metallic-400 mt-1">Manage customer orders</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                            <Download size={20} />
                            Export Orders
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Total Orders</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500/10">
                                <ShoppingCart className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Pending</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.pending}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-yellow-500/10">
                                <Package className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Revenue</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{formatPrice(stats.revenue)}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">This Month</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.thisMonth}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-500/10">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
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
                                    placeholder="Search by order number or customer email..."
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
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-metallic-50 border-b border-metallic-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Order</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Total</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Payment</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-dark-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-metallic-100">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-metallic-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-dark-900">{order.orderNumber}</p>
                                                <p className="text-sm text-metallic-500">{order.items?.length || 0} items</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-dark-900">
                                                    {order.customer?.firstName} {order.customer?.lastName}
                                                </p>
                                                <p className="text-sm text-metallic-500">{order.customer?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-metallic-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-dark-900">{formatPrice(order.total)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${order.paymentStatus === 'paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : order.paymentStatus === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                {order.paymentStatus || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </Link>
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
