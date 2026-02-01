export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'superadmin';
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  label: 'home' | 'work' | 'other';
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: string | null;
  subcategories?: Category[];
  isActive: boolean;
  order: number;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  inventory: number;
  attributes: { name: string; value: string }[];
  images: string[];
  isActive: boolean;
}

export interface ProductReview {
  _id: string;
  user: User;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand: string;
  category: Category;
  subcategory?: Category;
  tags: string[];
  price: number;
  comparePrice?: number;
  sku: string;
  inventory: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
  images: ProductImage[];
  primaryImage?: string;
  features?: { title: string; description: string; icon?: string }[];
  specifications?: { name: string; value: string }[];
  reviews: ProductReview[];
  rating: {
    average: number;
    count: number;
  };
  status: 'draft' | 'active' | 'archived';
  isFeatured: boolean;
  salesCount: number;
  viewsCount: number;
  inStock?: boolean;
  discountPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  variant?: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  sku: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  coupon?: {
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
  };
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
}

export interface OrderItem {
  product: Product | string;
  variant?: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: {
    code?: string;
    amount: number;
  };
  total: number;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  status: string;
  shipping: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  timeline: {
    status: string;
    note?: string;
    timestamp: string;
    updatedBy?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  user: User;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  changes?: { field: string; oldValue: any; newValue: any }[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
