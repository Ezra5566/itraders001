# ITraders Store - E-commerce Platform

A complete, production-ready e-commerce website for ITraders Store - a premium electronics retailer specializing in Apple, Samsung, and top-tier tech brands in Kenya.

![ITraders Store](frontend/public/images/logo.png)

## Features

### Customer Features
- Modern, responsive UI inspired by Apple's design aesthetics
- Product catalog with categories (iPhone, MacBook, iPad, Apple Watch, Samsung, etc.)
- Advanced product search and filtering
- Product detail pages with images, specifications, and reviews
- Shopping cart with quantity management
- Secure checkout with multiple payment options (M-Pesa, Cards)
- User authentication (Login/Register)
- Order history and tracking
- Wishlist functionality
- User profile management with multiple addresses

### Admin Features
- Comprehensive admin dashboard with analytics
- Product management (CRUD operations)
- Category management
- Order management with status updates
- Customer management
- Inventory tracking with low stock alerts
- Sales analytics and reporting
- Activity logs for audit trail
- Image upload and management

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** - Authentication
- **Multer** - File uploads
- **Stripe** - Payment processing
- **Helmet** & **CORS** - Security
- **Express Validator** - Input validation

## Project Structure

```
itraders001/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   ├── utils/           # Helper functions
│   │   └── config/          # Configuration
│   ├── uploads/             # Uploaded files
│   └── package.json
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities & API
│   │   ├── store/           # Redux store
│   │   └── types/           # TypeScript types
│   └── public/              # Static assets
└── README.md
```

## Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project
cd itraders001

# Setup backend
cd backend
cp .env.example .env
npm install

# Setup frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Environment Variables

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/itraders_store
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_your_key
```

**Frontend (.env)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### 3. Database Setup

```bash
# In backend directory
npm run seed
```

This creates:
- Admin user: `admin@itraders.store` / `admin123`
- Sample categories and products

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel)

```bash
cd frontend
vercel --prod
```

### MongoDB Atlas Setup

1. Create cluster at mongodb.com
2. Whitelist IP addresses
3. Create database user
4. Get connection string
5. Update `MONGODB_URI`

## API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products |
| GET | /api/products/:slug | Get product details |
| POST | /api/products | Create product (Admin) |
| PUT | /api/products/:id | Update product (Admin) |
| DELETE | /api/products/:id | Delete product (Admin) |

### Cart Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get cart |
| POST | /api/cart/items | Add item |
| PUT | /api/cart/items/:id | Update quantity |
| DELETE | /api/cart/items/:id | Remove item |

### Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Create order |
| GET | /api/orders | Get user orders |
| GET | /api/orders/:id | Get order details |

## Default Credentials

**Admin Account**
- Email: `admin@itraders.store`
- Password: `admin123`

## Customization

### Changing Brand Colors
Edit `frontend/tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: '#7C3AED', // Change this
    // ...
  }
}
```

### Adding Products
Use the admin panel at `/admin/products` or seed more data in `backend/src/utils/seed.js`.

### Payment Integration
The backend supports Stripe. For M-Pesa integration, add Daraja API endpoints.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- File upload restrictions

## Performance Optimizations

- Image optimization via Next.js
- Lazy loading components
- Redux state management
- API response caching
- MongoDB indexing
- Compression middleware

## License

MIT License - See LICENSE file

## Support

For support, email support@itraders.store or visit our store.

---

Built with passion by ITraders Store Team
