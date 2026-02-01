'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, CreditCard, Truck, Shield, RotateCcw } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { name: 'iPhone', href: '/category/iphone' },
      { name: 'MacBook', href: '/category/macbook' },
      { name: 'iPad', href: '/category/ipad' },
      { name: 'Apple Watch', href: '/category/apple-watch' },
      { name: 'Samsung Phones', href: '/category/samsung-phones' },
      { name: 'Accessories', href: '/category/accessories' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns & Exchanges', href: '/returns' },
      { name: 'Warranty', href: '/warranty' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-dark-900 text-white">
      {/* Features Bar */}
      <div className="border-b border-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-600/20 rounded-lg">
                <Truck className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Free Shipping</h3>
                <p className="text-xs text-metallic-400">On orders over KES 5,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-600/20 rounded-lg">
                <Shield className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Secure Payment</h3>
                <p className="text-xs text-metallic-400">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-600/20 rounded-lg">
                <RotateCcw className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Easy Returns</h3>
                <p className="text-xs text-metallic-400">14-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-600/20 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Flexible Payment</h3>
                <p className="text-xs text-metallic-400">M-Pesa & Cards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <div className="relative w-40 h-12 mb-4">
                <Image
                  src="/images/logo-white.png"
                  alt="ITraders Store"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-black text-sm mb-6 max-w-sm leading-relaxed">
              Your trusted destination for premium electronics in Kenya. 
              We offer authentic Apple, Samsung products with warranty and excellent customer service.
            </p>
            <div className="space-y-3">
              <a href="tel:+254700000000" className="flex items-center gap-3 text-metallic-300 hover:text-white transition-colors">
                <Phone size={18} />
                <span className="text-sm">+254 700 000 000</span>
              </a>
              <a href="mailto:support@itraders.store" className="flex items-center gap-3 text-metallic-300 hover:text-white transition-colors">
                <Mail size={18} />
                <span className="text-sm">support@itraders.store</span>
              </a>
              <div className="flex items-center gap-3 text-metallic-300">
                <MapPin size={18} />
                <span className="text-sm">Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-300 text-sm font-medium">
              &copy; {currentYear} ITraders Store. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com/itraders"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-metallic-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com/itraders"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-metallic-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com/itraders"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-metallic-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
