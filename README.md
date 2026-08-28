# 🛍️ LocalMart (Patgram Online Store)

> **A scalable, full-stack E-Commerce Platform and Retail Point of Sale (POS) solution.**  
> Built with **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **Supabase (PostgreSQL with RLS)**.

---


## ✨ Key Features

### 🛒 Customer Storefront
- **Dynamic Homepage**: Hero promo carousel slider, category navigator, flash sales, top-rated products, and promotional discount cards.
- **Advanced Product Filtering & Search**: Filter by categories, price range sliders, stock availability, ratings, and instant search queries.
- **Product Detail View**: High-resolution image galleries, quantity selectors, unit/pricing info, stock status indicators, customer reviews, and related product recommendations.
- **Smart Cart & Fast Checkout**: Real-time subtotal & discount calculation, progressive free shipping threshold progress bar, coupon redemption, Cash on Delivery (COD), and multiple payment gateway simulations.
- **User Account & Order Tracking**: User profiles, multi-address book management, real-time visual order status tracking timelines (`Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` / `Cancelled`), and wishlist management.
- **Full Localization**: Bangladeshi Taka (`৳` / BDT) currency formatting, Bengali numerals, and optimized UI for local e-commerce.

### ⚡ Point of Sale (POS) System
- **High-Speed Cashier Terminal**: Designed for fast physical store counter checkouts with keyboard-friendly operations.
- **Instant Product Search**: Instant lookup by barcode, SKU, or name with quick `+`/`-` quantity modifiers.
- **Flexible Discounts & Multi-Payment**: Flat amount or percentage discounts, multi-tender payment processing (Cash, Card, Mobile Banking via bKash, Nagad, Rocket), and partial/due amount tracking.
- **Printable Thermal Receipts**: Clean, professional, and instant printable POS invoices with order metadata.
- **POS Sales History & Auditing**: Daily walk-in sales records, shift revenue totals, and transaction breakdown.

### 🛠️ Admin Control Center
- **Analytics Dashboard**: Real-time sales metrics (Total Revenue, Orders, Products, Customers), interactive revenue charts (7-day, 30-day, and 3-month trends powered by Recharts), and urgent low-stock alerts.
- **Product Catalog Management (CRUD)**: Create, update, toggle active status, manage inventory quantities, categories, tags, SKU, and image assets.
- **Category Management**: Create and configure custom product categories, assign icons, and control display sort orders.
- **Order Pipeline Management**: Full lifecycle order management for both Online and POS orders, status transitions, payment verification, and customer delivery notes.
- **Customer Directory**: Customer profiles, purchase histories, accumulated spendings, and contact details.
- **Store Configuration**: Manage store profile (name, phone, address, email), delivery fees, free delivery minimums, low-stock threshold triggers, and notifications.

### 🔒 Security & Architecture
- **Supabase Authentication**: Secure user authentication and session persistence.
- **PostgreSQL Row Level Security (RLS)**: Fine-grained policies ensuring customers access only their own orders/addresses while administrators possess elevated management privileges.
- **Automated Database Triggers**: Automatically provisions user profile entries on `auth.users` registration.
- **High Performance**: Optimized database indexes on foreign keys, categories, and order lookups.

---

## 🏗️ Tech Stack

| Layer | Technologies / Libraries |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TanStack Start](https://tanstack.com/start) (Full-stack SSR) |
| **Routing** | [TanStack React Router](https://tanstack.com/router) (Type-safe file-based routing) |
| **Server & Bundler** | [Vite 8](https://vitejs.dev/) + [Nitro 3](https://nitro.unjs.io/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI Primitives](https://www.radix-ui.com/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL with RLS & Triggers) |
| **State Management** | TanStack Query + Custom React Contexts / LocalStorage Synchronization |
| **Charts & Analytics** | [Recharts](https://recharts.org/) |
| **Icons & Utilities** | [Lucide React](https://lucide.dev/), Sonner, Zod, React Hook Form, Date-fns |

---

## 📂 Project Structure

```plaintext
localmart/
├── public/                     # Static assets, logos, and favicons
├── src/
│   ├── assets/                 # Project images and graphic assets
│   ├── components/
│   │   ├── admin/              # Admin layout and dashboard components
│   │   │   └── AdminLayout.tsx
│   │   ├── shop/               # Storefront components (Header, Footer, ProductCard, etc.)
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── MobileBottomNav.tsx
│   │   └── ui/                 # Reusable UI primitives (Button, Dialog, Dropdown, etc.)
│   ├── data/                   # Fallback catalog data and fixtures
│   │   └── catalog.ts
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Stores, helpers, and configurations
│   │   ├── admin/              # Admin authentication, dataset provider, and POS store
│   │   │   ├── admin-auth.tsx
│   │   │   ├── admin-data.tsx
│   │   │   ├── pos-store.tsx
│   │   │   └── pos-types.ts
│   │   ├── auth-store.tsx      # Customer authentication state
│   │   ├── shop-store.tsx      # Customer cart, wishlist, and shop state
│   │   ├── supabase.ts         # Supabase client configuration
│   │   ├── database.types.ts   # Auto-generated database TypeScript interfaces
│   │   └── format.ts           # Taka (৳) currency & Bengali number formatters
│   ├── routes/                 # File-based TanStack routes
│   │   ├── __root.tsx          # Global application shell layout
│   │   ├── index.tsx           # Home storefront page (/)
│   │   ├── products.tsx        # Product catalog & filters (/products)
│   │   ├── categories.tsx      # Category browser (/categories)
│   │   ├── product/
│   │   │   └── $productId.tsx  # Product details view (/product/:productId)
│   │   ├── cart.tsx            # Shopping cart (/cart)
│   │   ├── checkout.tsx        # Order checkout page (/checkout)
│   │   ├── orders.tsx          # Customer order tracking (/orders)
│   │   ├── account.tsx         # User profile and address book (/account)
│   │   ├── wishlist.tsx        # Customer wishlist (/wishlist)
│   │   ├── offers.tsx          # Promotional offers page (/offers)
│   │   ├── login.tsx           # Customer sign-in (/login)
│   │   ├── register.tsx        # Customer registration (/register)
│   │   └── admin/              # Admin control panel routes
│   │       ├── index.tsx       # Admin authentication (/admin)
│   │       ├── dashboard.tsx   # Analytics & KPI overview (/admin/dashboard)
│   │       ├── orders.tsx      # Order management pipeline (/admin/orders)
│   │       ├── categories.tsx  # Category management (/admin/categories)
│   │       ├── customers.tsx   # Customer directory (/admin/customers)
│   │       ├── settings.tsx    # Store settings & fees (/admin/settings)
│   │       ├── pos.index.tsx   # POS cash counter interface (/admin/pos)
│   │       ├── pos.history.tsx # POS sales records (/admin/pos/history)
│   │       └── products/       # Product management (list, new, edit)
│   │           ├── index.tsx
│   │           ├── new.tsx
│   │           └── edit.$id.tsx
│   ├── router.tsx              # Application router setup
│   ├── server.ts               # SSR / Nitro entry point
│   ├── start.ts                # TanStack Start handler
│   └── styles.css              # Global styling & Tailwind theme variables
├── supabase/
│   └── migration.sql           # Database schema, RLS policies, triggers & seeds
├── package.json
└── vite.config.ts
```

---

## 🗄️ Database Architecture & Schema

The database backend is structured in `supabase/migration.sql` with 7 core tables:

1. **`profiles`**: Extended user metadata (name, phone, email, avatar). Synced with `auth.users` via trigger.
2. **`categories`**: Product categories (slug, name, icon, image, sort order).
3. **`products`**: Product specifications (name, description, category, price, old_price, stock, unit, brand, SKU, active status).
4. **`addresses`**: Saved delivery addresses per customer.
5. **`orders`**: Unified Online and POS orders (order number, customer details, subtotal, discount, total amount, paid/due amounts, payment method, order source, and delivery status).
6. **`order_items`**: Individual items attached to each order with historical unit price snapshots.
7. **`settings`**: Dynamic key-value store (JSONB) for store metadata, delivery charges, and alert thresholds.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher) or **Bun**
- A **Supabase** project account

### 2. Installation
Clone the repository and install the dependencies:

```bash
cd localmart
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Supabase Setup & Migrations
1. Navigate to your **Supabase Dashboard** and open the **SQL Editor**.
2. Copy and execute the contents of [`supabase/migration.sql`](file:///c:/Users/ALIF/OneDrive/Desktop/anti/localmart/supabase/migration.sql).
3. Under **Authentication > Users**, create an admin user with the email configured in your policies (default: `admin@patgram.com`).

### 5. Running Locally
Start the development server:

```bash
npm run dev
```
Open your browser at `http://localhost:8080` (or the port specified in terminal output).

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local development server |
| `npm run build` | Compiles the production bundle |
| `npm run preview` | Previews the compiled production build locally |
| `npm run lint` | Runs ESLint to check code quality and syntax errors |
| `npm run format` | Formats code with Prettier |

---

<div align="center">
  <sub>Engineered for <b>LocalMart / Patgram Online Store</b></sub>
</div>
