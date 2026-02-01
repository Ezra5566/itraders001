'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminApi, authApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    Settings as SettingsIcon, Store, CreditCard, Truck,
    Mail, User, Lock, Save
} from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const { isAdmin, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [settings, setSettings] = useState({
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        contactPhone: '',
        currency: 'USD',
        taxRate: '',
        shippingFee: '',
    });

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!isAdmin) {
            router.push('/');
            return;
        }
        fetchSettings();
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [isAdmin, user]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getSettings();
            const data = response.data.data;
            setSettings({
                siteName: data.siteName || 'ITraders Store',
                siteDescription: data.siteDescription || '',
                contactEmail: data.contactEmail || '',
                contactPhone: data.contactPhone || '',
                currency: data.currency || 'USD',
                taxRate: data.taxRate?.toString() || '',
                shippingFee: data.shippingFee?.toString() || '',
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await adminApi.updateSettings({
                ...settings,
                taxRate: parseFloat(settings.taxRate) || 0,
                shippingFee: parseFloat(settings.shippingFee) || 0,
            });
            alert('Settings saved successfully!');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            alert(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            await authApi.updateProfile(profileData);
            alert('Profile updated successfully!');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setSaving(true);
        try {
            await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error('Error changing password:', error);
            alert(error.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'general', name: 'General', icon: SettingsIcon },
        { id: 'store', name: 'Store', icon: Store },
        { id: 'payment', name: 'Payment', icon: CreditCard },
        { id: 'shipping', name: 'Shipping', icon: Truck },
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Security', icon: Lock },
    ];

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
                    <div>
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-metallic-400 mt-1">Manage your store settings and preferences</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <nav className="space-y-1 p-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-metallic-600 hover:bg-metallic-50'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span>{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-dark-900 mb-6">General Settings</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Site Name
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.siteName}
                                            onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Site Description
                                        </label>
                                        <textarea
                                            value={settings.siteDescription}
                                            onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.contactEmail}
                                            onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Contact Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={settings.contactPhone}
                                            onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Store Settings */}
                        {activeTab === 'store' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-dark-900 mb-6">Store Settings</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Currency
                                        </label>
                                        <select
                                            value={settings.currency}
                                            onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="KES">KES - Kenyan Shilling</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Tax Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.taxRate}
                                            onChange={(e) => setSettings(prev => ({ ...prev, taxRate: e.target.value }))}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payment Settings */}
                        {activeTab === 'payment' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-dark-900 mb-6">Payment Settings</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            Payment gateway configuration is managed through environment variables.
                                            Contact your system administrator to update payment settings.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                                defaultChecked
                                            />
                                            <span className="text-sm text-dark-900">Accept Credit Cards</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                                defaultChecked
                                            />
                                            <span className="text-sm text-dark-900">Accept PayPal</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-dark-900">Cash on Delivery</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Settings */}
                        {activeTab === 'shipping' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-dark-900 mb-6">Shipping Settings</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Default Shipping Fee
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.shippingFee}
                                            onChange={(e) => setSettings(prev => ({ ...prev, shippingFee: e.target.value }))}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-dark-900">Free shipping over $100</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-dark-900 mb-6">Profile Settings</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-900 mb-1">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                                className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-900 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
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
                                            value={profileData.email}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-dark-900 mb-6">Change Password</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-900 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        <Lock size={20} />
                                        {saving ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
