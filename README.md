# ShopDeshi - Artisan Marketplace 🏺

youtube link https://youtu.be/mPT3Ss3wZ5A?si=ULoJIxAdL2YkHod7


A comprehensive direct marketplace connecting Bangladeshi artisans with global buyers, built with the MERN stack. ShopDeshi creates a bridge between handicraft makers and customers without third-party involvement, featuring direct communication, secure payments, educational content, and authentic craft experiences.

## 🎯 Project Vision

ShopDeshi empowers local artisans by providing a complete e-commerce platform for direct sales of traditional handicrafts. The platform prioritizes:

- **Direct Connection**: Eliminate middlemen between artisans and buyers
- **Cultural Preservation**: Showcase traditional Bangladeshi craftsmanship
- **Fair Trade**: Ensure artisans receive fair compensation for their work
- **Educational Platform**: Share craft knowledge through tutorials and stories
- **Authentic Stories**: Preserve the journey and heritage behind each craft

## ✨ Features

### ✅ **Complete Feature Set (Implemented)**

#### **Core E-commerce**
- **Product Management**: Full CRUD operations for inventory management
- **Order System**: Complete order lifecycle from placement to delivery
- **Payment Processing**: Secure Stripe integration with webhook verification
- **Shopping Cart**: Add/remove items, manage quantities, and checkout
- **Wishlist**: Save products for future purchase

#### **User Experience**
- **User Authentication**: Clerk-based secure login system
- **Purchase History**: Complete order tracking for customers
- **Review System**: Rate and review products with automatic moderation
- **Search & Filter**: Advanced product discovery with category filtering
- **Status Updates**: Real-time order status management

#### **Educational Content**
- **Video Tutorials**: YouTube API integration for craft tutorials and DIY content
- **Tutorial Management**: Upload, organize, and manage educational content
- **Cultural Stories**: Background and history of traditional crafts
- **Tips & Techniques**: Professional insights from experienced artisans

#### **Admin & Seller Tools**
- **Seller Dashboard**: Comprehensive product upload and management system
- **Admin Dashboard**: Complete administrative control panel
- **Complaint System**: Customer support and issue resolution
- **File Upload**: Secure image handling with Multer
- **Analytics**: Sales tracking and performance insights

#### **Communication & Support**
- **Email Notifications**: Automated order confirmations and updates
- **Customer Support**: Integrated complaint and resolution system
- **Bad Word Detection**: Automatic content moderation for reviews

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React.js with Tailwind CSS | User interface and styling |
| **Backend** | Node.js with Express.js | Server-side logic and APIs |
| **Database** | MongoDB | Data storage and management |
| **Authentication** | Clerk | User authentication and management |
| **Payments** | Stripe API with Webhooks | Secure payment processing |
| **Video Integration** | YouTube API | Tutorial and educational content |
| **File Upload** | Multer | Image and file handling |
| **Email Service** | Nodemailer | Automated notifications |
| **Content Moderation** | Bad Words Filter | Review and content moderation |
| **Deployment** | Vercel (Frontend) | Application hosting |
| **Platform** | Web Application | Cross-platform accessibility |

## 📊 Database Architecture

### Collections (6 Schemas)

1. **User Collection**
   - Customer account management
   - Profile information and preferences
   - Authentication data integration

2. **Product Collection**
   - Complete inventory management
   - Reviews and ratings integration
   - Purchase tracking and analytics

3. **Order Collection**
   - Full order lifecycle management
   - Payment status tracking
   - Shipping and delivery information

4. **Review Collection**
   - Standalone review system
   - Moderation and quality control
   - Rating aggregation

5. **Complaint Collection**
   - Customer support system
   - Issue tracking and resolution
   - Communication history

6. **Tutorial Collection**
   - Video content management
   - Educational resource organization
   - Artisan knowledge sharing

## 🔌 API Endpoints (40+ Routes)

### Product Management
```
GET    /api/products              # Get all products
GET    /api/products/search       # Search products
GET    /api/products/category/:id # Get by category
GET    /api/products/:id          # Get product details
POST   /api/products              # Create product (Sellers)
PUT    /api/products/:id          # Update product (Sellers)
DELETE /api/products/:id          # Delete product (Admin/Seller)
```

### Order Management
```
POST   /api/orders                # Create new order
GET    /api/orders                # Get user orders
GET    /api/orders/:id            # Get order details
PUT    /api/orders/:id/status     # Update order status
GET    /api/admin/orders          # Get all orders (Admin)
```

### Payment Processing
```
POST   /api/payment/create-intent # Create payment intent
POST   /api/payment/webhook       # Stripe webhook handler
GET    /api/payment/verify/:id    # Verify payment status
```

### Review System
```
POST   /api/reviews               # Add product review
GET    /api/reviews/:productId    # Get product reviews
PUT    /api/reviews/:id           # Update review
DELETE /api/reviews/:id           # Delete review (Admin)
GET    /api/admin/reviews         # Moderate reviews (Admin)
```

### User Management
```
GET    /api/users/profile         # Get user profile
PUT    /api/users/profile         # Update profile
GET    /api/users/purchase-history # Get purchase history
POST   /api/users/wishlist        # Manage wishlist
GET    /api/users/cart            # Get cart items
```

### Tutorial System
```
POST   /api/tutorials             # Create tutorial
GET    /api/tutorials             # Get all tutorials
GET    /api/tutorials/:id         # Get tutorial details
PUT    /api/tutorials/:id         # Update tutorial
DELETE /api/tutorials/:id         # Delete tutorial
POST   /api/tutorials/video       # Upload YouTube video
```

### Support System
```
POST   /api/complaints            # Submit complaint
GET    /api/complaints            # Get user complaints
GET    /api/admin/complaints      # Get all complaints (Admin)
PUT    /api/complaints/:id        # Update complaint status
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (Local or MongoDB Atlas)
- **npm or yarn** package manager
- **Clerk Account** for authentication
- **Stripe Account** for payment processing
- **YouTube API Key** for video integration

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ramisaaaa/shopdeshi.git
cd shopdeshi
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Navigate to backend directory if separate
cd backend && npm install
```

### 3. Frontend Setup
```bash
# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Security
JWT_SECRET=your_jwt_secret_key
BCRYPT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 5. Run the Application

```bash
# Development mode (both frontend and backend)
npm run dev

# Backend only
npm run server

# Frontend only
npm run client

# Production build
npm run build
```

## 📁 Project Structure

```
shopdeshi/
├── backend/
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   ├── userController.js
│   │   ├── paymentController.js
│   │   ├── tutorialController.js
│   │   └── complaintController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Complaint.js
│   │   └── Tutorial.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   ├── users.js
│   │   ├── payments.js
│   │   ├── tutorials.js
│   │   └── complaints.js
│   ├── utils/
│   │   ├── email.js
│   │   ├── validation.js
│   │   ├── badWords.js
│   │   └── helpers.js
│   ├── config/
│   │   ├── database.js
│   │   └── stripe.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   ├── review/
│   │   │   └── tutorial/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Blog.jsx
│   │   │   ├── Tutorials.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SellerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Support.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── CartContext.js
│   │   │   └── ProductContext.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useApi.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── uploads/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── LICENSE
```

## 🔐 Security & Safety Features

### Implemented Security Measures

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Content Moderation**: Automatic bad word filtering for reviews
- **File Upload Security**: Type and size validation for uploads
- **Payment Security**: Stripe webhook signature verification
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Comprehensive data validation on all endpoints
- **Error Handling**: Secure error responses without data exposure

### Privacy Features
- **Auto Data Cleanup**: Automatic sensitive data removal after order completion
- **Secure File Storage**: Protected file upload and storage system
- **Email Privacy**: Secure email handling and notifications

## 📊 Available Scripts

```bash
# Development
npm start          # Run backend server
npm run server     # Run backend with nodemon
npm run client     # Run React frontend
npm run dev        # Run both concurrently

# Production
npm run build      # Build for production
npm run prod       # Run production server

# Testing & Maintenance
npm test           # Run test suite
npm run lint       # Check code style
npm run clean      # Clean build files
```

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   # Connect your GitHub repository to Vercel
   # Set build command: npm run build
   # Set output directory: frontend/build
   ```

2. **Environment Variables**
   ```env
   REACT_APP_API_URL=your_backend_url
   REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   ```

3. **Deploy**
   - Automatic deployment on push to main branch
   - Custom domain configuration available

### Backend Deployment Options

#### Option 1: Railway/Render
```bash
# Add to package.json
"scripts": {
  "start": "node server.js",
  "build": "npm install"
}
```

#### Option 2: VPS/DigitalOcean
```bash
# PM2 Process Manager
npm install -g pm2
pm2 start server.js --name "shopdeshi-backend"
pm2 startup
pm2 save
```

### Database Deployment
- **MongoDB Atlas**: Recommended for production
- **Local MongoDB**: For development only

## 📈 Performance Features

- **Image Optimization**: Automatic image compression and resizing
- **Lazy Loading**: Efficient content loading for better performance
- **Caching**: Strategic caching for frequently accessed data
- **Database Indexing**: Optimized queries for fast data retrieval
- **CDN Integration**: Fast asset delivery through CDN

## 🎯 Business Impact

### For Artisans
- **Direct Sales**: 100% of profits go to creators
- **Global Reach**: Access to international markets
- **Brand Building**: Showcase craft stories and heritage
- **Educational Revenue**: Monetize knowledge through tutorials

### For Buyers
- **Authentic Products**: Direct from creators with verified stories
- **Educational Value**: Learn traditional craft techniques
- **Cultural Connection**: Support heritage preservation
- **Quality Assurance**: Review system ensures product quality

### For Community
- **Cultural Preservation**: Keep traditional crafts alive
- **Economic Development**: Support local artisan communities
- **Knowledge Transfer**: Share traditional techniques globally
- **Sustainable Commerce**: Promote ethical and fair trade

## 🤝 Contributing

We welcome contributions to ShopDeshi! Please follow these steps:

### Getting Started
1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/shopdeshi.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Submitting Changes
1. **Commit your changes**
   ```bash
   git commit -m 'Add: Amazing new feature'
   ```
2. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
3. **Open a Pull Request**

### Coding Standards
- Use meaningful variable and function names
- Comment complex logic
- Follow React and Node.js best practices
- Maintain consistent formatting



## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### MIT License Summary
```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

## 🙏 Acknowledgments

- **[Clerk](https://clerk.dev/)** - Authentication and user management
- **[Stripe](https://stripe.com/)** - Secure payment processing
- **[MongoDB](https://www.mongodb.com/)** - Database solution
- **[Tailwind CSS](https://tailwindcss.com/)** - UI styling framework
- **[YouTube API](https://developers.google.com/youtube)** - Video content integration
- **[Vercel](https://vercel.com/)** - Frontend hosting and deployment
- **Bangladeshi Artisan Community** - Inspiration and cultural heritage

## 📧 Contact & Support

- **Project Repository**: [https://github.com/ramisaaaa/shopdeshi](https://github.com/ramisaaaa/shopdeshi)
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/ramisaaaa/shopdeshi/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/ramisaaaa/shopdeshi/discussions)
- **Email**: [Contact through GitHub](https://github.com/ramisaaaa)

## 🌍 Mission Statement

**Empowering Bangladeshi artisans through technology**

ShopDeshi aims to preserve traditional craftsmanship while providing artisans with modern tools to reach global markets. Every purchase supports local communities, preserves cultural heritage, and ensures that traditional crafts continue to thrive in the digital age.

Together, we're building a sustainable ecosystem where artisans can prosper, buyers can discover authentic crafts, and cultural heritage remains vibrant for future generations.

---

*Made with ❤️ for the Bangladeshi artisan community*
