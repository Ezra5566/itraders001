'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    TrendingUp, DollarSign, ShoppingCart, Users,
    Calendar, Download, Package
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function AnalyticsPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [salesData, setSalesData] = useState<any[]>([]);
    const [customerData, setCustomerData] = useState<any>(null);
    const [productData, setProductData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
    });

    useEffect(() => {
        if (!isAdmin) {
            router.push('/');
            return;
        }
        fetchAnalytics();
    }, [isAdmin, period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [salesRes, customersRes, productsRes] = await Promise.all([
                analyticsApi.getSales({ period }),
                analyticsApi.getCustomers(),
                analyticsApi.getProducts(),
            ]);

            const sales = salesRes.data.data;
            setSalesData(sales.salesByDay?.map((d: any) => ({
                date: `${d._id.day}/${d._id.month}`,
                revenue: d.sales,
                orders: d.orders,
            })) || []);

            setCustomerData(customersRes.data.data);
            setProductData(productsRes.data.data.topProducts || []);

            // Calculate stats
            const totalRevenue = sales.salesByDay?.reduce((sum: number, d: any) => sum + d.sales, 0) || 0;
            const totalOrders = sales.salesByDay?.reduce((sum: number, d: any) => sum + d.orders, 0) || 0;

            setStats({
                totalRevenue,
                totalOrders,
                totalCustomers: customersRes.data.data.total || 0,
                avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    if (!isAdmin) return null;

    if (loading) {
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
                            <h1 className="text-2xl font-bold">Analytics</h1>
                            <p className="text-metallic-400 mt-1">Track your store performance</p>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="px-4 py-2 bg-dark-50 border border-dark-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="year">Last Year</option>
                            </select>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                                <Download size={20} />
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Total Revenue</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">
                                    {formatPrice(stats.totalRevenue)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Total Orders</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.totalOrders}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500/10">
                                <ShoppingCart className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Total Customers</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.totalCustomers}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-500/10">
                                <Users className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Avg Order Value</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">
                                    {formatPrice(stats.avgOrderValue)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-500/10">
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-dark-900 mb-4">Revenue Trend</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#7C3AED"
                                        strokeWidth={3}
                                        dot={{ fill: '#7C3AED', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Orders Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-dark-900 mb-4">Orders Trend</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="orders" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-dark-900 mb-4">Top Products by Revenue</h2>
                        <div className="space-y-3">
                            {productData.slice(0, 5).map((product: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-metallic-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <Package className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-dark-900">{product.name}</p>
                                            <p className="text-sm text-metallic-500">{product.salesCount} sold</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-primary-600">
                                        {formatPrice(product.revenue || product.price * product.salesCount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-dark-900 mb-4">Sales by Category</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={productData.slice(0, 5).map((p: any) => ({
                                            name: p.name,
                                            value: p.salesCount,
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => entry.name}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {productData.slice(0, 5).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Customer Insights */}
                {customerData && (
                    <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-dark-900 mb-4">Customer Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-metallic-50 rounded-lg">
                                <p className="text-sm text-metallic-500">New Customers</p>
                                <p className="text-3xl font-bold text-primary-600 mt-2">
                                    {customerData.newCustomers || 0}
                                </p>
                                <p className="text-sm text-metallic-500 mt-1">This {period}</p>
                            </div>
                            <div className="text-center p-4 bg-metallic-50 rounded-lg">
                                <p className="text-sm text-metallic-500">Returning Customers</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {customerData.returningCustomers || 0}
                                </p>
                                <p className="text-sm text-metallic-500 mt-1">Repeat purchases</p>
                            </div>
                            <div className="text-center p-4 bg-metallic-50 rounded-lg">
                                <p className="text-sm text-metallic-500">Customer Retention</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {customerData.retentionRate || 0}%
                                </p>
                                <p className="text-sm text-metallic-500 mt-1">Retention rate</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
