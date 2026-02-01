# ITraders Store - Project Structure

```
itraders001/
├── README.md                    # Main project documentation
├── DEPLOYMENT.md                # Deployment guide
├── PROJECT_STRUCTURE.md         # This file
├── .env.example                 # Environment variables template
│
├── backend/                     # Node.js/Express API
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   ├── uploads/                 # File uploads directory
│   │   ├── products/
│   │   └── logos/
│   └── src/
│       ├── server.js            # Entry point
│       ├── config/
│       │   ├── database.js      # MongoDB connection
│       │   └── cloudinary.js    # Cloudinary config
│       ├── controllers/         # Route controllers
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── product.controller.js
│       │   ├── category.controller.js
│       │   ├── cart.controller.js
│       │   ├── order.controller.js
│       │   ├── admin.controller.js
│       │   ├── analytics.controller.js
│       │   └── upload.controller.js
│       ├── middleware/          # Express middleware
│       │   ├── auth.js          # JWT authentication
│       │   └── errorHandler.js
│       ├── models/              # Mongoose schemas
│       │   ├── index.js
│       │   ├── User.js
│       │   ├── Product.js
│       │   ├── Category.js
│       │   ├── Cart.js
│       │   ├── Order.js
│       │   └── ActivityLog.js
│       ├── routes/              # API routes
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── product.routes.js
│       │   ├── category.routes.js
│       │   ├── cart.routes.js
│       │   ├── order.routes.js
│       │   ├── admin.routes.js
│       │   ├── analytics.routes.js
│       │   └── upload.routes.js
│       └── utils/               # Helper functions
│           ├── generateToken.js
│           └── seed.js          # Database seeder
│
└── frontend/                    # Next.js frontend
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── .env.example
    ├── .gitignore
    ├── public/
    │   ├── images/
    │   │   └── logo.png         # Brand logo
    │   └── fonts/
    └── src/
        ├── app/                 # Next.js App Router
        │   ├── layout.tsx       # Root layout
        │   ├── page.tsx         # Home page
        │   ├── globals.css      # Global styles
        │   ├── providers.tsx    # Redux provider
        │   ├── login/
        │   │   └── page.tsx
        │   ├── register/
        │   │   └── page.tsx
        │   ├── cart/
        │   │   └── page.tsx
        │   ├── category/
        │   │   └── [slug]/
        │   │       └── page.tsx
        │   ├── product/
        │   │   └── [slug]/
        │   │       └── page.tsx
        │   └── admin/
        │       ├── layout.tsx   # Admin layout
        │       └── page.tsx     # Admin dashboard
        │
        ├── components/
        │   ├── ui/              # Reusable UI components
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Badge.tsx
        │   │   └── LoadingSpinner.tsx
        │   ├── layout/          # Layout components
        │   │   ├── Header.tsx
        │   │   └── Footer.tsx
        │   ├── product/         # Product components
        │   ├── cart/            # Cart components
        │   └── auth/            # Auth components
        │
        ├── hooks/               # Custom React hooks
        │   ├── useAuth.ts
        │   └── useCart.ts
        │
        ├── lib/                 # Utilities
        │   ├── api.ts           # API client
        │   └── utils.ts         # Helper functions
        │
        ├── store/               # Redux store
        │   ├── index.ts
        │   └── slices/
        │       ├── authSlice.ts
        │       └── cartSlice.ts
        │
        └── types/               # TypeScript types
            └── index.ts
```

## Key Features by Directory

### Backend
- **Controllers**: Business logic for each entity
- **Models**: MongoDB schemas with validations
- **Routes**: RESTful API endpoints
- **Middleware**: Authentication and error handling
- **Utils**: JWT generation and database seeding

### Frontend
- **App**: Next.js 14 app router pages
- **Components**: Reusable UI components
- **Hooks**: Custom hooks for auth and cart
- **Store**: Redux state management
- **Types**: Shared TypeScript interfaces

## API Endpoints Summary

### Auth
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Products
- GET `/api/products` - List products
- GET `/api/products/:slug` - Get product details
- POST `/api/products` - Create product (Admin)

### Cart
- GET `/api/cart` - Get cart
- POST `/api/cart/items` - Add item

### Orders
- GET `/api/orders` - Get user orders
- POST `/api/orders` - Create order

### Admin
- GET `/api/admin/dashboard` - Dashboard stats
- GET `/api/admin/logs` - Activity logs

## Component Hierarchy

```
Root Layout
├── Header
│   └── UserMenu
├── Main Content
│   └── Page-specific components
└── Footer
    └── NewsletterSignup

Admin Layout
├── Sidebar
│   └── Navigation Links
└── Main Content
    └── Admin-specific components
```

## State Management

### Redux Store
- **auth**: User authentication state
- **cart**: Shopping cart state

### Local State
- Form inputs
- UI toggles
- Pagination

## File Naming Conventions

- **Components**: PascalCase (Button.tsx)
- **Pages**: page.tsx (Next.js convention)
- **Utilities**: camelCase (utils.ts)
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase (Product.ts)

---

Total Files: 50+ source files
Lines of Code: ~15,000+
