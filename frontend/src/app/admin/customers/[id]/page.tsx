'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { userApi, orderApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Calendar,
    ShoppingCart, Heart, Edit, Trash2, Shield
} from 'lucide-react';
import Link from 'next/link';

interface Customer {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    addresses?: any[];
    wishlist?: any[];
    createdAt: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
}

export default function CustomerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = params.id as string;
    const { isAdmin } = useAuth();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'customer',
    });

    useEffect(() => {
        if (!isAdmin) {
            router.push('/');
            return;
        }
        fetchCustomer();
        fetchCustomerOrders();
    }, [isAdmin, customerId]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const response = await userApi.getUser(customerId);
            const customerData = response.data.data;
            setCustomer(customerData);
            setFormData({
                firstName: customerData.firstName || '',
                lastName: customerData.lastName || '',
                email: customerData.email || '',
                phone: customerData.phone || '',
                role: customerData.role || 'customer',
            });
        } catch (error) {
            console.error('Error fetching customer:', error);
            alert('Failed to load customer');
            router.push('/admin/customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerOrders = async () => {
        try {
            const response = await orderApi.getAllOrders({ customer: customerId });
            setOrders(response.data.data.orders || response.data.data || []);
        } catch (error) {
            console.error('Error fetching customer orders:', error);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await userApi.updateUser(customerId, formData);
            alert('Customer updated successfully!');
            setEditMode(false);
            fetchCustomer();
        } catch (error: any) {
            console.error('Error updating customer:', error);
            alert(error.response?.data?.message || 'Failed to update customer');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            return;
        }

        try {
            await userApi.deleteUser(customerId);
            alert('Customer deleted successfully!');
            router.push('/admin/customers');
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Failed to delete customer');
        }
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

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    if (!isAdmin) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!customer) return null;

    return (
        <div className="min-h-screen bg-metallic-50">
            {/* Header */}
            <div className="bg-dark-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/customers"
                                className="p-2 hover:bg-dark-50 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                                    {customer.firstName?.[0]}{customer.lastName?.[0]}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {customer.firstName} {customer.lastName}
                                    </h1>
                                    <p className="text-metallic-400 mt-1">{customer.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!editMode ? (
                                <>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                                    >
                                        <Edit size={20} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={updating}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {updating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="px-4 py-2 bg-metallic-600 hover:bg-metallic-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-dark-900 mb-4">Customer Information</h2>

                            {editMode ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-900 mb-1">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                                className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-900 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                                className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Role
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <User className="text-metallic-400" size={20} />
                                        <div>
                                            <p className="text-sm text-metallic-500">Full Name</p>
                                            <p className="text-dark-900">{customer.firstName} {customer.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="text-metallic-400" size={20} />
                                        <div>
                                            <p className="text-sm text-metallic-500">Email</p>
                                            <p className="text-dark-900">{customer.email}</p>
                                        </div>
                                    </div>
                                    {customer.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="text-metallic-400" size={20} />
                                            <div>
                                                <p className="text-sm text-metallic-500">Phone</p>
                                                <p className="text-dark-900">{customer.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Shield className="text-metallic-400" size={20} />
                                        <div>
                                            <p className="text-sm text-metallic-500">Role</p>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${customer.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {customer.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-metallic-400" size={20} />
                                        <div>
                                            <p className="text-sm text-metallic-500">Member Since</p>
                                            <p className="text-dark-900">{new Date(customer.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order History */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <ShoppingCart className="text-primary-600" size={20} />
                                <h2 className="text-lg font-bold text-dark-900">Order History</h2>
                            </div>

                            {orders.length > 0 ? (
                                <div className="space-y-3">
                                    {orders.map((order) => (
                                        <Link
                                            key={order._id}
                                            href={`/admin/orders/${order._id}`}
                                            className="flex items-center justify-between p-4 border border-metallic-200 rounded-lg hover:border-primary-500 transition-colors"
                                        >
                                            <div>
                                                <p className="font-medium text-dark-900">{order.orderNumber}</p>
                                                <p className="text-sm text-metallic-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-dark-900">{formatPrice(order.total)}</p>
                                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-metallic-500 text-center py-8">No orders yet</p>
                            )}
                        </div>

                        {/* Addresses */}
                        {customer.addresses && customer.addresses.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="text-primary-600" size={20} />
                                    <h2 className="text-lg font-bold text-dark-900">Addresses</h2>
                                </div>
                                <div className="space-y-3">
                                    {customer.addresses.map((address: any, index: number) => (
                                        <div key={index} className="p-4 border border-metallic-200 rounded-lg">
                                            <p className="text-dark-900">{address.street}</p>
                                            <p className="text-metallic-600">
                                                {address.city}, {address.state} {address.zipCode}
                                            </p>
                                            <p className="text-metallic-600">{address.country}</p>
                                            {address.isDefault && (
                                                <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-dark-900 mb-4">Statistics</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-metallic-500">Total Orders</p>
                                    <p className="text-2xl font-bold text-dark-900">{orders.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-metallic-500">Total Spent</p>
                                    <p className="text-2xl font-bold text-primary-600">{formatPrice(totalSpent)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-metallic-500">Average Order Value</p>
                                    <p className="text-2xl font-bold text-dark-900">
                                        {orders.length > 0 ? formatPrice(totalSpent / orders.length) : formatPrice(0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Wishlist */}
                        {customer.wishlist && customer.wishlist.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Heart className="text-primary-600" size={20} />
                                    <h2 className="text-lg font-bold text-dark-900">Wishlist</h2>
                                </div>
                                <p className="text-metallic-600">{customer.wishlist.length} items</p>
                            </div>
                        )}

                        {/* Account Activity */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-dark-900 mb-4">Account Activity</h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-metallic-500">Last Order</p>
                                    <p className="text-dark-900">
                                        {orders.length > 0
                                            ? new Date(orders[0].createdAt).toLocaleDateString()
                                            : 'No orders'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-metallic-500">Account Created</p>
                                    <p className="text-dark-900">{new Date(customer.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
