'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    Users, Search, Eye, UserPlus, TrendingUp,
    ChevronLeft, ChevronRight, Shield, User
} from 'lucide-react';
import Link from 'next/link';

interface Customer {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
    ordersCount?: number;
    totalSpent?: number;
}

export default function CustomersPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        newThisMonth: 0,
        admins: 0
    });

    useEffect(() => {
        if (!isAdmin) {
            router.push('/');
            return;
        }
        fetchCustomers();
    }, [isAdmin, currentPage, roleFilter]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params: any = { page: currentPage, limit: 10 };
            if (roleFilter) params.role = roleFilter;
            if (searchTerm) params.search = searchTerm;

            const response = await userApi.getAllUsers(params);
            const data = response.data.data;

            setCustomers(data.users || data);
            setTotalPages(data.totalPages || 1);

            // Calculate stats
            const allCustomers = data.users || data;
            const now = new Date();
            const thisMonth = allCustomers.filter((c: Customer) => {
                const createdDate = new Date(c.createdAt);
                return createdDate.getMonth() === now.getMonth() &&
                    createdDate.getFullYear() === now.getFullYear();
            }).length;

            setStats({
                total: allCustomers.length,
                newThisMonth: thisMonth,
                admins: allCustomers.filter((c: Customer) => c.role === 'admin').length,
            });
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchCustomers();
    };

    if (!isAdmin) return null;

    if (loading && customers.length === 0) {
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
                            <h1 className="text-2xl font-bold">Customers</h1>
                            <p className="text-metallic-400 mt-1">Manage customer accounts</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Total Customers</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500/10">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">New This Month</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.newThisMonth}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <TrendingUp className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Administrators</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.admins}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-500/10">
                                <Shield className="w-6 h-6 text-purple-500" />
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
                                    placeholder="Search by name or email..."
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
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Roles</option>
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-metallic-50 border-b border-metallic-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Phone</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">Joined</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-dark-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-metallic-100">
                                {customers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-metallic-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                                                    {customer.firstName?.[0]}{customer.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-dark-900">
                                                        {customer.firstName} {customer.lastName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-metallic-600">
                                            {customer.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-metallic-600">
                                            {customer.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${customer.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {customer.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-metallic-600">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/customers/${customer._id}`}
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
