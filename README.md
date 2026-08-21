# Nova Store — Full-Stack E-Commerce Platform

Nova Store is a modern full-stack e-commerce web application built with React, Laravel, MySQL, and ImageKit.

The project includes a complete customer storefront, authentication system, shopping cart, favorites, checkout, order tracking, product and category management, and an admin dashboard.

## 🌐 Live Demo

**Frontend:**  
https://ecommerce-platform-ashen-two.vercel.app/

**Backend API:**  
https://ecommerce-platform-4vwn.onrender.com/api

## ✨ Features

### Customer Features

- Modern responsive user interface
- Browse products
- Browse categories
- Featured products
- Sale products
- Product details page
- Product image gallery
- Shopping cart
- Favorites / Wishlist
- User registration and login
- Secure authentication
- Checkout system
- Create orders
- My Orders page
- Order details
- Order tracking
- Invoice view
- Currency support
- Responsive design for mobile, tablet, and desktop

### Admin Features

- Admin dashboard
- Product management
- Add, edit, and delete products
- Upload product images
- Category management
- Add, edit, and delete categories
- Upload category images
- Order management
- Update order status
- Update payment status
- Store settings
- Homepage settings
- Featured products management

## 🛠 Technologies

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- Context API
- Lucide React
- CSS

### Backend

- Laravel
- PHP
- REST API
- Laravel Sanctum
- Eloquent ORM

### Database

- MySQL
- Railway

### Image Hosting

- ImageKit

### Deployment

- Vercel — Frontend
- Render — Laravel Backend
- Railway — MySQL Database

## 🏗 Architecture

```text
React / Vercel
      |
      v
Laravel REST API / Render
      |
      v
MySQL / Railway

Product & Category Images
      |
      v
ImageKit CDN
```

## 📁 Project Structure

```text
ecommerce-platform/
│
├── backend/
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── sections/
│   │   └── ...
│   └── ...
│
└── README.md
```

## 🔗 API Examples

### Products

```http
GET /api/products
```

### Featured Products

```http
GET /api/products?featured=1
```

### Single Product

```http
GET /api/products/{slug}
```

### Categories

```http
GET /api/categories
```

### Homepage Settings

```http
GET /api/home-settings
```

### Authentication

```http
POST /api/register
POST /api/login
GET /api/me
POST /api/logout
```

### Orders

```http
POST /api/orders
GET /api/my-orders
GET /api/orders/{order}
```

## ⚡ Performance Optimizations

The project includes several performance improvements:

- Shared homepage data using React Context
- Reduced duplicate API requests
- Laravel caching for categories
- Laravel caching for homepage settings
- Laravel caching for featured products
- Optimized product API responses
- Primary image loading for product lists
- Full image loading only on product details pages
- ImageKit CDN image optimization
- Image resizing and compression
- Lazy loading for non-critical images
- Pagination for products

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/firasmostafa/ecommerce-platform.git
```

Enter the project:

```bash
cd ecommerce-platform
```

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables

The backend requires configuration for:

```env
APP_URL=

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

Never commit passwords, private API keys, or production secrets to GitHub.

## 📱 Responsive Design

Nova Store is designed to work across:

- Mobile phones
- Tablets
- Laptops
- Desktop screens

## 👨‍💻 Author

**Firas Mostafa**

Software Developer

GitHub:  
https://github.com/firasmostafa

## 📄 License

This project was created for learning, portfolio, and software development purposes.