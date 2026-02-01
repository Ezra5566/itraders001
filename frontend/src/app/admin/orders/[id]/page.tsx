'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { orderApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    ArrowLeft, Package, MapPin, CreditCard, Truck,
    User, Mail, Phone, Calendar, Printer
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
    product: { name: string; images: string[] };
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    orderNumber: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    items: OrderItem[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    tracking?: {
        carrier: string;
        trackingNumber: string;
        url: string;
    };
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const { isAdmin } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [trackingData, setTrackingData] = useState({
        carrier: '',
        trackingNumber: '',
        url: '',
    });

    useEffect(() => {
        if (!isAdmin) {
            router.push('/');
            return;
        }
        fetchOrder();
    }, [isAdmin, orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getOrder(orderId);
            const orderData = response.data.data;
            setOrder(orderData);
            setNewStatus(orderData.status);
            if (orderData.tracking) {
                setTrackingData(orderData.tracking);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            alert('Failed to load order');
            router.push('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === order?.status) return;

        setUpdating(true);
        try {
            await orderApi.updateStatus(orderId, newStatus);
            alert('Order status updated successfully!');
            fetchOrder();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const handleTrackingUpdate = async () => {
        if (!trackingData.carrier || !trackingData.trackingNumber) {
            alert('Please fill in carrier and tracking number');
            return;
        }

        setUpdating(true);
        try {
            await orderApi.addTracking(orderId, trackingData);
            alert('Tracking information added successfully!');
            fetchOrder();
        } catch (error) {
            console.error('Error adding tracking:', error);
            alert('Failed to add tracking information');
        } finally {
            setUpdating(false);
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

    if (!isAdmin) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-metallic-50">
            {/* Header */}
            <div className="bg-dark-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/orders"
                                className="p-2 hover:bg-dark-50 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
                                <p className="text-metallic-400 mt-1">
                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                        >
                            <Printer size={20} />
                            Print Invoice
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-dark-900 mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 pb-4 border-b border-metallic-100 last:border-0">
                                        <div className="w-20 h-20 bg-metallic-100 rounded-lg overflow-hidden">
                                            {item.product?.images?.[0] ? (
                                                <img
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-metallic-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium text-dark-900">{item.product?.name}</p>
                                            <p className="text-sm text-metallic-500 mt-1">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-dark-900">{formatPrice(item.price)}</p>
                                            <p className="text-sm text-metallic-500 mt-1">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-6 border-t border-metallic-200">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-metallic-600">Subtotal</span>
                                        <span className="text-dark-900">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-metallic-600">Shipping</span>
                                        <span className="text-dark-900">{formatPrice(order.shipping)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-metallic-600">Tax</span>
                                        <span className="text-dark-900">{formatPrice(order.tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-metallic-200">
                                        <span className="text-dark-900">Total</span>
                                        <span className="text-primary-600">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="text-primary-600" size={20} />
                                <h2 className="text-lg font-bold text-dark-900">Shipping Address</h2>
                            </div>
                            <div className="text-metallic-600">
                                <p>{order.shippingAddress.street}</p>
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>

                        {/* Tracking Information */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Truck className="text-primary-600" size={20} />
                                <h2 className="text-lg font-bold text-dark-900">Tracking Information</h2>
                            </div>

                            {order.tracking ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-metallic-600">
                                        <span className="font-medium">Carrier:</span> {order.tracking.carrier}
                                    </p>
                                    <p className="text-sm text-metallic-600">
                                        <span className="font-medium">Tracking Number:</span> {order.tracking.trackingNumber}
                                    </p>
                                    {order.tracking.url && (
                                        <a
                                            href={order.tracking.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary-600 hover:underline"
                                        >
                                            Track Package →
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Carrier (e.g., FedEx, UPS)"
                                        value={trackingData.carrier}
                                        onChange={(e) => setTrackingData(prev => ({ ...prev, carrier: e.target.value }))}
                                        className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tracking Number"
                                        value={trackingData.trackingNumber}
                                        onChange={(e) => setTrackingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                                        className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <input
                                        type="url"
                                        placeholder="Tracking URL (optional)"
                                        value={trackingData.url}
                                        onChange={(e) => setTrackingData(prev => ({ ...prev, url: e.target.value }))}
                                        className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <button
                                        onClick={handleTrackingUpdate}
                                        disabled={updating}
                                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        {updating ? 'Adding...' : 'Add Tracking Info'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="text-primary-600" size={20} />
                                <h2 className="text-lg font-bold text-dark-900">Customer</h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium text-dark-900">
                                        {order.customer.firstName} {order.customer.lastName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-metallic-600">
                                    <Mail size={16} />
                                    <a href={`mailto:${order.customer.email}`} className="hover:text-primary-600">
                                        {order.customer.email}
                                    </a>
                                </div>
                                {order.customer.phone && (
                                    <div className="flex items-center gap-2 text-sm text-metallic-600">
                                        <Phone size={16} />
                                        <a href={`tel:${order.customer.phone}`} className="hover:text-primary-600">
                                            {order.customer.phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-dark-900 mb-4">Order Status</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-dark-900 mb-2">
                                        Current Status
                                    </label>
                                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-900 mb-2">
                                        Update Status
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating || newStatus === order.status}
                                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updating ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="text-primary-600" size={20} />
                                <h2 className="text-lg font-bold text-dark-900">Payment</h2>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-metallic-600">Method</span>
                                    <span className="text-dark-900 capitalize">{order.paymentMethod || 'Card'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-metallic-600">Status</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${order.paymentStatus === 'paid'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.paymentStatus || 'pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="text-primary-600" size={20} />
                                <h2 className="text-lg font-bold text-dark-900">Timeline</h2>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-metallic-600">Created</p>
                                    <p className="text-dark-900">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-metallic-600">Last Updated</p>
                                    <p className="text-dark-900">{new Date(order.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
