# VKF Invoice Application

A full-stack GST invoice management application built with React and Node.js/Express.

## Features

- **Invoice Management** - Create, edit, and list GST-compliant tax invoices
- **Invoice Preview** - Professional tax invoice template with company header, customer details, items table, GST summary, and signature section
- **Print** - Browser-native print with clean layout (hides navbar and action buttons)
- **PDF Download** - Generate and download invoices as PDF files (A4 format with multi-page support)
- **GST Support** - Both IGST and CGST+SGST tax calculation modes
- **Auto-numbering** - Sequential invoice numbers in `INV-YYYYMMDD-XXXX` format
- **Authentication** - JWT-based login with protected routes

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, React Router 6, Vite, Axios  |
| Backend  | Node.js, Express 4                      |
| Database | PostgreSQL                              |
| Auth     | JWT, bcryptjs                           |
| PDF      | html2canvas, jsPDF (dynamic-imported)   |

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v13 or higher
- **npm** (included with Node.js)

## Quick Setup (Windows)

Run the setup script:

```
setup.bat
```

This installs all dependencies and creates a `.env` template.

## Manual Setup

### 1. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 2. Database setup

Create the database and run the init script:

```bash
psql -U postgres -c "CREATE DATABASE vkf_invoice;"
psql -U postgres -d vkf_invoice -f database/init.sql
```

### 3. Configure environment

Create `server/.env`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vkf_invoice
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### 4. Start the application

```bash
# Terminal 1 - Server (port 5000)
cd server
npm start

# Terminal 2 - Client (port 5173)
cd client
npm run dev
```

### 5. Open in browser

Navigate to `http://localhost:5173`

**Default login:** `admin` / `admin123`

## Project Structure

```
vkf-invoice/
├── client/                     # React frontend
│   └── src/
│       ├── components/         # Reusable components
│       │   ├── InvoiceItemRow.jsx
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/            # Auth context
│       ├── data/               # Static data (customers, products)
│       ├── pages/
│       │   ├── CreateInvoicePage.jsx   # Create & edit invoices
│       │   ├── InvoiceListPage.jsx     # Invoice listing with actions
│       │   ├── InvoicePreviewPage.jsx  # Preview, print, PDF
│       │   └── LoginPage.jsx
│       ├── services/           # Axios API client
│       ├── App.jsx             # Routes
│       └── index.css           # Styles + print media query
├── server/                     # Express backend
│   ├── config/db.js            # PostgreSQL pool
│   ├── controllers/
│   │   ├── authController.js   # Login
│   │   └── invoiceController.js # CRUD operations
│   ├── middleware/auth.js      # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   └── invoices.js
│   └── index.js                # Server entry point
├── database/
│   └── init.sql                # Schema + seed data
├── setup.bat                   # Windows setup script
└── README.md
```

## API Endpoints

| Method | Endpoint            | Description              | Auth |
|--------|---------------------|--------------------------|------|
| POST   | /api/auth/login     | User login               | No   |
| GET    | /api/invoices       | List all invoices        | Yes  |
| GET    | /api/invoices/:id   | Get invoice with items   | Yes  |
| POST   | /api/invoices       | Create new invoice       | Yes  |
| PUT    | /api/invoices/:id   | Update existing invoice  | Yes  |
| GET    | /api/health         | Health check             | No   |

## Client Routes

| Path                    | Page                  | Description          |
|-------------------------|-----------------------|----------------------|
| /login                  | LoginPage             | Authentication       |
| /invoices               | InvoiceListPage       | Invoice listing      |
| /invoices/new           | CreateInvoicePage     | Create new invoice   |
| /invoices/:id/edit      | CreateInvoicePage     | Edit existing invoice|
| /invoices/:id/preview   | InvoicePreviewPage    | Preview, print, PDF  |

## Build for Production

```bash
# Build client
cd client
npm run build

# The built files will be in client/dist/
# Serve them with any static file server or configure Express to serve them
```
