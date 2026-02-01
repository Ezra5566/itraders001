# ITraders Store - AI Agent Guide

This document provides essential information for AI coding agents working on the ITraders Store e-commerce project.

## Project Overview

**ITraders Store** is a full-stack e-commerce platform for a premium electronics retailer based in Kenya, specializing in Apple, Samsung, and other top-tier tech brands. The platform serves both customers (shopping) and administrators (inventory management, analytics).

### Quick Facts
- **Project Type**: Full-stack web application
- **Monorepo Structure**: Backend (Node.js/Express) + Frontend (Next.js)
- **Target Region**: Kenya (M-Pesa integration planned, KES currency)
- **Total Files**: 50+ source files
- **Approximate LOC**: ~15,000+

## Technology Stack

### Backend (`/backend/`)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | ^4.18.2 | Web framework |
| MongoDB | 6+ | Database |
| Mongoose | ^8.0.3 | ODM |
| JWT | ^9.0.2 | Authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| Multer | ^1.4.5 | File uploads |
| Cloudinary | ^1.41.1 | Image hosting |
| Stripe | ^14.9.0 | Payment processing |
| Helmet | ^7.1.0 | Security headers |
| express-rate-limit | ^7.1.5 | Rate limiting |

### Frontend (`/frontend/`)
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.0.4 | React framework (App Router) |
| React | ^18.2.0 | UI library |
| TypeScript | ^5.3.3 | Type safety |
| Tailwind CSS | ^3.3.6 | Styling |
| Redux Toolkit | ^2.0.1 | State management |
| Axios | ^1.6.2 | HTTP client |
| Framer Motion | ^10.16.16 | Animations |
| Recharts | ^2.10.3 | Data visualization |
| Zod | ^3.22.4 | Schema validation |
| React Hook Form | ^7.49.2 | Form handling |
| Stripe React | ^2.4.0 | Payment integration |

## Project Structure

```
itraders001/
├── backend/                      # Node.js/Express API
│   ├── src/
│   │   ├── server.js             # Entry point (Express app setup)
│   │   ├── config/
│   │   │   ├── database.js       # MongoDB connection
│   │   │   └── cloudinary.js     # Cloudinary configuration
│   │   ├── controllers/          # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── order.controller.js
│   │   │   └── ... (10 total)
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authentication & authorization
│   │   │   └── errorHandler.js   # Global error handling
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── User.js           # User accounts (roles: user/admin/superadmin)
│   │   │   ├── Product.js        # Products with variants, reviews
│   │   │   ├── Category.js       # Hierarchical categories
│   │   │   ├── Cart.js           # Shopping cart
│   │   │   ├── Order.js          # Orders with timeline
│   │   │   └── ActivityLog.js    # Admin audit logs
│   │   ├── routes/               # API route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   └── ... (9 total)
│   │   └── utils/
│   │       ├── generateToken.js  # JWT utilities
│   │       └── seed.js           # Database seeder
│   ├── uploads/                  # Local file uploads (dev only)
│   ├── package.json
│   └── .env                      # Backend environment variables
│
├── frontend/                     # Next.js 14 frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── layout.tsx        # Root layout (Header + Footer)
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── login/page.tsx    # Auth pages
│   │   │   ├── register/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── product/[slug]/   # Product detail (dynamic route)
│   │   │   ├── category/[slug]/  # Category page (dynamic route)
│   │   │   └── admin/            # Admin dashboard
│   │   │       ├── layout.tsx    # Admin sidebar layout
│   │   │       └── page.tsx      # Dashboard
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI (Button, Input, Badge, etc.)
│   │   │   ├── layout/           # Header, Footer
│   │   │   ├── product/          # Product cards, grids
│   │   │   └── auth/             # Auth forms
│   │   ├── hooks/
│   │   │   ├── useAuth.ts        # Auth state hook
│   │   │   └── useCart.ts        # Cart operations hook
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios instance + API methods
│   │   │   └── utils.ts          # Helper functions (cn, formatters)
│   │   ├── store/                # Redux store
│   │   │   ├── index.ts          # Store configuration
│   │   │   └── slices/
│   │   │       ├── authSlice.ts  # Auth state (login/logout/user)
│   │   │       └── cartSlice.ts  # Cart state
│   │   └── types/
│   │       └── index.ts          # TypeScript interfaces
│   ├── public/images/            # Static assets
│   ├── tailwind.config.ts        # Custom theme (purple brand)
│   ├── tsconfig.json
│   └── .env                      # Frontend environment variables
│
└── shared/                       # Reserved for shared types (currently empty)
```

## Build & Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Development server (nodemon, port 5000)
npm start            # Production server (node)
npm run seed         # Seed database with sample data
npm test             # Run Jest tests (if any)
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
```

### Full Setup (New Environment)
```bash
# 1. Backend setup
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.
npm install
npm run seed

# 2. Frontend setup
cd ../frontend
cp .env.example .env
# Edit .env with API URL
npm install

# 3. Run both (in separate terminals)
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
```env
# Required
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/itraders_store
JWT_SECRET=your_super_secret_key_min_32_chars

# Optional but recommended
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
STRIPE_SECRET_KEY=sk_test_xxx
CLIENT_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
```

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## API Architecture

### Base URL
- Development: `http://localhost:5000/api`
- All responses follow format: `{ success: boolean, data?: any, message?: string }`

### Authentication
- JWT Bearer token in `Authorization` header
- Token obtained from `/api/auth/login` or `/api/auth/register`
- Roles: `user`, `admin`, `superadmin`
- Middleware: `authenticate` (required), `authorize('admin', 'superadmin')` (role check)

### Key Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create account |
| `/api/auth/login` | POST | No | Login, returns JWT |
| `/api/auth/me` | GET | Yes | Current user |
| `/api/products` | GET | No | List products (paginated) |
| `/api/products/:slug` | GET | No | Product detail |
| `/api/products` | POST | Admin | Create product |
| `/api/cart` | GET | Yes | Get user's cart |
| `/api/cart/items` | POST | Yes | Add to cart |
| `/api/orders` | POST | Yes | Create order |
| `/api/orders` | GET | Yes | User's orders |
| `/api/admin/dashboard` | GET | Admin | Dashboard stats |
| `/api/upload/image` | POST | Yes | Upload image to Cloudinary |

## Data Models

### User
- Email, password (hashed), first/last name, phone
- Role: `user` | `admin` | `superadmin`
- Addresses array (with default flag)
- Wishlist (Product refs)

### Product
- Name, slug (auto-generated), description, brand
- Category reference, tags
- Pricing: price, comparePrice (for discounts)
- Inventory: quantity, low stock threshold
- Variants support (size, color, etc.)
- Images (Cloudinary URLs), videos
- Reviews (embedded array with user ref)
- Specifications, features
- Status: `draft` | `active` | `archived`
- Sales/views counters

### Order
- Order number (auto-generated)
- Customer info (denormalized from User)
- Items array (product snapshot)
- Shipping/billing addresses
- Payment: method, status, transactionId
- Status: `pending` → `processing` → `shipped` → `delivered`
- Timeline array (status changes with notes)

## Code Style Guidelines

### JavaScript/TypeScript
- Use **semicolons** (backend) / optional (frontend)
- Prefer `const`/`let` over `var`
- Use async/await for async operations
- Backend: CommonJS (`require`/`module.exports`)
- Frontend: ES modules (`import`/`export`)

### Naming Conventions
| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Pages | page.tsx (Next.js) | `app/login/page.tsx` |
| Utilities | camelCase | `formatPrice.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `Product`, `User` |
| Database models | PascalCase | `Product.js` |

### File Organization
- One main export per file (component, controller, etc.)
- Co-locate related files (component + styles if needed)
- Group by feature in backend (controllers, routes, models)

## Testing Strategy

- **Backend**: Jest configured (`npm test`), but test files are minimal/non-existent currently
- **Frontend**: No test framework configured (could add Jest + React Testing Library)
- **Manual Testing**: Use seeded data (admin@itraders.store / admin123)
- **API Testing**: Can use the health check endpoint `GET /api/health`

## Security Considerations

### Implemented
- JWT authentication with bcrypt password hashing (12 rounds)
- Helmet.js for security headers
- Rate limiting: 100 requests per 15 minutes per IP
- CORS configured for specific origins
- MongoDB injection protection via Mongoose
- File upload restrictions (Multer)

### Required for Production
- HTTPS/TLS certificate
- Strong JWT_SECRET (min 32 random characters)
- MongoDB authentication enabled
- Regular dependency audits: `npm audit fix`
- Hide detailed error messages in production (`NODE_ENV=production`)
- Input validation via express-validator on all routes

## Deployment Notes

### Recommended Stack
- **Backend**: Render.com, Railway, or VPS with PM2
- **Frontend**: Vercel (optimal for Next.js)
- **Database**: MongoDB Atlas (M0 free tier available)
- **Images**: Cloudinary
- **CDN**: Cloudflare (optional)

### Build Configuration
- Backend: `npm install` → `npm start` (no build step)
- Frontend: `npm run build` → `.next/` output
- Static files served from `/uploads` on backend

### Post-Deployment Checklist
1. Update `CLIENT_URL` and `NEXT_PUBLIC_API_URL` to production domains
2. Change default admin password immediately
3. Configure MongoDB Atlas IP whitelist
4. Set up SSL certificate
5. Configure Stripe webhook endpoints
6. Test all payment flows

## Common Issues & Solutions

### CORS Errors
Update `backend/src/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-domain.com', 'https://www.your-domain.com'],
  credentials: true
}));
```

### MongoDB Connection Failed
- Check if MongoDB is running locally OR
- Verify Atlas connection string and IP whitelist
- Ensure database user has correct permissions

### Build Failures
```bash
# Clear cache and rebuild
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### Image Uploads Not Working
- Verify Cloudinary credentials
- Check upload directory permissions (for local uploads)
- Ensure file size doesn't exceed limits (10MB)

## Dependencies to Know

### Critical Backend Dependencies
- `mongoose`: All database operations use Mongoose models
- `jsonwebtoken`: Token generation in `utils/generateToken.js`
- `express-validator`: Request validation in controllers
- `slugify`: Auto-generating URL slugs from product names

### Critical Frontend Dependencies
- `@reduxjs/toolkit`: State management in `store/`
- `axios`: HTTP client configured in `lib/api.ts`
- `react-hook-form` + `@hookform/resolvers` + `zod`: Form validation
- `framer-motion`: Page transitions and animations
- `lucide-react`: Icon library throughout UI
- `date-fns`: Date formatting

## Default Credentials (After Seeding)
- **Admin Email**: `admin@itraders.store`
- **Password**: `admin123`
- **Location**: `/admin` route in frontend

---

*Last Updated: February 2025*
*For questions or updates to this document, refer to README.md and DEPLOYMENT.md*
