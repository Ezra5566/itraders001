import { Store, ShieldCheck, Truck, Clock } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="bg-dark-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">About iTraders Store</h1>
                    <p className="text-xl text-metallic-300 max-w-2xl mx-auto">
                        Your premium destination for latest tech gadgets and electronics in Kenya.
                    </p>
                </div>
            </div>

            {/* Story Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-dark-900 mb-6">Our Story</h2>
                        <div className="space-y-4 text-metallic-600">
                            <p>
                                Founded with a vision to bring premium technology closer to Kenyans, iTraders Store has grown from a small online reseller to one of the most trusted tech hubs in the region.
                            </p>
                            <p>
                                We believe that technology should be accessible, genuine, and fairly priced. That's why we partner directly with authorized distributors to ensure every product we sell is 100% authentic and comes with a valid warranty.
                            </p>
                            <p>
                                Whether you're looking for the latest iPhone, a powerful MacBook, or high-end audio accessories, we've curated a selection that meets the standards of even the most demanding tech enthusiasts.
                            </p>
                        </div>
                    </div>
                    <div className="relative h-[400px] bg-metallic-100 rounded-2xl overflow-hidden">
                        {/* Placeholder for About Image - could use a stock photo of a modern tech store or office */}
                        <div className="absolute inset-0 flex items-center justify-center bg-metallic-200 text-metallic-400">
                            <Store size={64} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-metallic-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-900 mb-3">Genuine Products</h3>
                            <p className="text-metallic-600">
                                All our products are sourced directly from manufacturers and authorized distributors, guaranteeing authenticity.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <Truck className="w-6 h-6 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-900 mb-3">Fast Delivery</h3>
                            <p className="text-metallic-600">
                                We offer same-day delivery within Nairobi and reliable courier services countrywide.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <Clock className="w-6 h-6 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-900 mb-3">Excellent Support</h3>
                            <p className="text-metallic-600">
                                Our team is available 6 days a week to help you choose the right product and assist with any after-sales queries.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
