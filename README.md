ShopDeshi goes beyond just selling products - it's an educational platform where artisans share their knowledge:

- **Video Tutorials**: Step-by-step craft tutorials uploaded via YouTube API
- **DIY Guides**: Written articles with detailed instructions
- **Cultural Stories**: Background and history of traditional crafts
- **Tips & Techniques**: Professional insights from experienced artisans# ShopDeshi - Artisan Marketplace

A direct marketplace connecting Bangladeshi artisans with buyers, built with the MERN stack. ShopDeshi creates a bridge between handicraft makers and customers without third-party involvement, featuring direct communication, secure payments, and authentic craft experiences.

## 🎯 Project Concept

ShopDeshi empowers local artisans by providing a platform for direct sales of traditional handicrafts. The platform prioritizes:
- **Direct Connection**: Eliminate middlemen between artisans and buyers
- **Cultural Preservation**: Showcase traditional Bangladeshi craftsmanship
- **Fair Trade**: Ensure artisans receive fair compensation
- **Authentic Stories**: Share the journey and heritage behind each craft

## ✨ Features

### Currently Implemented
- ✅ **User Authentication**: Clerk-based login system
- ✅ **Home Page**: Landing page with featured products
- ✅ **Shop Page**: Product browsing and category filtering
- ✅ **Blog Page**: Articles and video tutorials with YouTube API integration
- ✅ **Wishlist**: Save products for future purchase
- ✅ **Shopping Cart**: Add/remove items and manage quantities
- ✅ **Seller Dashboard**: Upload new products with images and descriptions
- ✅ **Search Functionality**: Working search bar with category-based filtering
- ✅ **Rating & Reviews**: Rate and review products with user feedback
- ✅ **Video Tutorials**: YouTube API integration for craft tutorials and DIY content
- ✅ **Video Tutorials**: YouTube API integration for craft tutorials and DIY content
- ✅ **Backend API**: Connected to MongoDB for data management

### Planned Features
- 🚧 **Dual Registration**: Separate profiles for buyers and sellers
- 🚧 **Payment Integration**: Stripe API for secure transactions
- 🚧 **Messaging System**: Direct chat between users (MongoDB + Socket.io for real-time)
- 🚧 **Order Management**: Complete order lifecycle from placement to delivery
- 🚧 **Artisan Profiles**: Dedicated pages showcasing craft journeys and stories
- 🚧 **Sales Analytics**: Advanced seller dashboard with sales tracking and analytics

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React.js with Tailwind CSS |
| **Backend** | Node.js with Express.js |
| **Database** | MongoDB |
| **Authentication** | Clerk |
| **Payments** | Stripe API Checkout |
| **Video Integration** | YouTube API |
| **Real-time Chat** | Socket.io (planned) |
| **Deployment** | Vercel (frontend) |
| **Platform** | Web Application |

## 🔐 Security & Auditing

### Security Measures to be implemented:

- **Password Hashing**: Bcrypt for secure password storage
- **Content Moderation**: Warning system for inappropriate language
- **Activity Logging**: Security monitoring and user safety tracking
- **Auto Data Cleanup**: Automatic address removal after 30 days post-order

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn
- Clerk account for authentication

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramisaaaa/shopdeshi.git
   cd shopdeshi
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   
   # Clerk Authentication
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # YouTube API
   YOUTUBE_API_KEY=your_youtube_api_key
   
   # Future integrations
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Security
   JWT_SECRET=your_jwt_secret_key
   BCRYPT_ROUNDS=12
   ```

5. **Run the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

## 📁 Project Structure

```
shopdeshi/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── Blog.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── SellerDashboard.jsx
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Currently Available
- `GET /api/products` - Get all products
- `GET /api/products/search` - Search products by name/description
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Sellers)
- `PUT /api/products/:id` - Update product (Sellers)
- `POST /api/wishlist` - Add to wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/cart` - Add to cart
- `GET /api/cart` - Get cart items
- `POST /api/reviews` - Add product review
- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/blog` - Create blog post/tutorial
- `GET /api/blog` - Get all blog posts
- `POST /api/blog/video` - Upload YouTube tutorial video
- `GET /api/blog/videos` - Get video tutorials

### Planned Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders
- `POST /api/messages` - Send message
- `GET /api/artisans/:id` - Get artisan profile
- `GET /api/analytics/seller` - Get seller analytics

## 🚀 Development Roadmap

### Phase 1 (Completed ✅)
- [x] Basic frontend pages (Home, Shop, Blog, Wishlist, Cart)
- [x] Authentication with Clerk
- [x] MongoDB integration
- [x] Shopping cart functionality
- [x] Seller dashboard with product upload
- [x] Search functionality with category filtering
- [x] Rating and review system
- [x] YouTube API integration for video tutorials
- [x] Rating and review products

### Phase 2 (Next)
- [ ] Dual user registration (buyers vs sellers)
- [ ] Payment integration with Stripe
- [ ] Order management system
- [ ] Inventory tracking for sellers

### Phase 3 (Future)
- [ ] Real-time messaging
- [ ] Artisan story profiles


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Scripts

```bash
npm start          # Run backend server
npm run server     # Run backend with nodemon
npm run client     # Run React frontend
npm run dev        # Run both concurrently
npm run build      # Build for production
npm test           # Run tests
```

## 🌍 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend


## 🏆 Mission

**Empowering Bangladeshi artisans through technology**

ShopDeshi aims to preserve traditional craftsmanship while providing artisans with modern tools to reach global markets. Every purchase supports local communities and keeps cultural heritage alive.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Project Link: [https://github.com/ramisaaaa/shopdeshi](https://github.com/ramisaaaa/shopdeshi)


- [Clerk](https://clerk.dev/) for authentication
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [MongoDB](https://www.mongodb.com/) for database
- [Stripe](https://stripe.com/) for payment processing
