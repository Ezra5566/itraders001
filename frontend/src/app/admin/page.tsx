'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminApi, analyticsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Users, Package, ShoppingCart, TrendingUp, 
  DollarSign, Activity, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    lowStockProducts: number;
    monthlySales: { total: number; count: number };
    yearlySales: { total: number; count: number };
  };
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          adminApi.getDashboard(),
          analyticsApi.getSales({ period: 'month' }),
        ]);
        setStats(statsRes.data.data);
        setSalesData(analyticsRes.data.data.salesByDay.map((d: any) => ({
          date: `${d._id.day}/${d._id.month}`,
          sales: d.sales,
          orders: d.orders,
        })));
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: formatPrice(stats?.stats.yearlySales.total || 0), 
      icon: DollarSign, 
      trend: '+12%',
      trendUp: true,
      color: 'bg-green-500' 
    },
    { 
      title: 'Monthly Sales', 
      value: formatPrice(stats?.stats.monthlySales.total || 0), 
      icon: TrendingUp, 
      trend: '+8%',
      trendUp: true,
      color: 'bg-blue-500' 
    },
    { 
      title: 'Total Orders', 
      value: stats?.stats.totalOrders || 0, 
      icon: ShoppingCart, 
      trend: '+5%',
      trendUp: true,
      color: 'bg-purple-500' 
    },
    { 
      title: 'Total Users', 
      value: stats?.stats.totalUsers || 0, 
      icon: Users, 
      trend: '+15%',
      trendUp: true,
      color: 'bg-orange-500' 
    },
  ];

  return (
    <div className="min-h-screen bg-metallic-50">
      {/* Admin Header */}
      <div className="bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-metallic-400 mt-1">Welcome back, {user?.firstName}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm">
                {stats?.stats.pendingOrders} Pending Orders
              </span>
              {stats?.stats.lowStockProducts > 0 && (
                <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm">
                  {stats?.stats.lowStockProducts} Low Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-metallic-500">{card.title}</p>
                  <p className="text-2xl font-bold text-dark-900 mt-1">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.trendUp ? (
                      <ArrowUpRight size={16} className="text-green-500" />
                    ) : (
                      <ArrowDownRight size={16} className="text-red-500" />
                    )}
                    <span className={card.trendUp ? 'text-green-500' : 'text-red-500'}>
                      {card.trend}
                    </span>
                    <span className="text-metallic-400 text-sm">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${card.color}/10`}>
                  <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-dark-900 mb-4">Sales Overview</h2>
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
                    dataKey="sales" 
                    stroke="#7C3AED" 
                    strokeWidth={2}
                    dot={{ fill: '#7C3AED' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-dark-900 mb-4">Orders by Day</h2>
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
                  <Bar dataKey="orders" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-metallic-100">
              <h2 className="text-lg font-bold text-dark-900">Recent Orders</h2>
            </div>
            <div className="divide-y divide-metallic-100">
              {stats?.recentOrders.slice(0, 5).map((order: any) => (
                <div key={order._id} className="p-4 flex items-center justify-between hover:bg-metallic-50">
                  <div>
                    <p className="font-medium text-dark-900">{order.orderNumber}</p>
                    <p className="text-sm text-metallic-500">{order.customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary-600">{formatPrice(order.total)}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-metallic-100">
              <h2 className="text-lg font-bold text-dark-900">Top Products</h2>
            </div>
            <div className="divide-y divide-metallic-100">
              {stats?.topProducts.slice(0, 5).map((product: any) => (
                <div key={product._id} className="p-4 flex items-center gap-4 hover:bg-metallic-50">
                  <div className="w-12 h-12 bg-metallic-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-metallic-400" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-dark-900 line-clamp-1">{product.name}</p>
                    <p className="text-sm text-metallic-500">{product.salesCount} sold</p>
                  </div>
                  <p className="font-medium text-primary-600">{formatPrice(product.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
