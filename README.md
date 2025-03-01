# 🛒 Smart Grocery Delivery Application

A modern grocery delivery platform that connects local store owners with customers and features intelligent delivery time estimation based on real-time location data.

## ✨ Features

### For Store Owners
- **Secure Authentication**: Dedicated sign-in portal for store owners
- **Inventory Management**: Add, update, and manage product listings with ease
- **Location Registration**: Register store location for accurate delivery time calculations
- **Order Tracking**: Monitor and manage incoming customer orders

### For Customers
- **User Authentication**: Simple sign-up and login process
- **Product Discovery**: Browse products from local stores
- **Shopping Cart**: Add and manage items before checkout
- **Flexible Payment Options**: Support for both card payments and Cash on Delivery
- **Smart Delivery Estimation**: Real-time delivery time calculations based on customer and store locations

## 🔧 Technology Stack

- **Frontend**: React.js with modern UI components
- **Backend**: Node.js/Express.js RESTful API
- **Database**: MongoDB for data persistence
- **Geolocation**: Integration with Gemini API for location-based services and delivery time estimation
- **Authentication**: JWT-based authentication flow
- **State Management**: Context API/Redux for application state

## 📸 Application Screenshots

### Admin/Store Owner Interface

#### Store Owner Sign-In Page
![Store Owner Sign-In](https://github.com/user-attachments/assets/9c0d6a6b-c096-4f0a-8940-2c2fc3b72d2f)

*Secure authentication portal for store owners*

#### Store Owner Dashboard
![Store Owner Dashboard](https://github.com/user-attachments/assets/f7cb5234-4dfd-44bf-a775-ab58a0200118)
*Main control panel for store management*

#### Inventory Management
![Inventory Management](https://github.com/user-attachments/assets/f4611480-102f-4243-ab57-c5f4d6ad268a)

*Interface for adding and updating product inventory*

### Customer Interface

#### Customer Registration
![Customer Registration](https://github.com/user-attachments/assets/e7c4f6a3-b10b-4747-bd11-8e3078e64f5b)

*User-friendly sign-up process for new customers*

#### Customer Login
![Customer Login](https://github.com/user-attachments/assets/8b26b2cd-9f22-4d46-a8a7-1a7d6999c97c)

*Secure login portal for returning customers*

#### Product Browsing
![Product Browsing](https://github.com/user-attachments/assets/1bf4e293-cfaa-46c3-9107-059decb25028)

*Interactive product catalog with search and filter capabilities*

#### Shopping Cart
![Shopping Cart](https://github.com/user-attachments/assets/785185a9-48cf-4c09-bff9-d2668a174c8c)

*Comprehensive cart view with quantity management*

#### Payment Options
![Payment Options](https://github.com/user-attachments/assets/39ae61d3-0069-4b55-a11a-f4f8f98d1ed5)

*Multiple payment method selection for checkout*

#### Order Confirmation
![Order Confirmation](https://github.com/user-attachments/assets/b6bdf8f6-ff67-47c7-b187-0b8a3298e792)

*Order success page with estimated delivery time based on location data*

## 🌟 Key Features Explained

### Intelligent Delivery Time Estimation
The application uses the Gemini API to:
1. Capture store location during registration
2. Obtain customer location during checkout
3. Calculate estimated delivery time based on:
   - Distance between locations
   - Current traffic conditions
   - Store preparation time
   - Courier availability

### Dual User Roles
The system supports two distinct user types:
- **Store Owners**: Can manage inventory, update store details, and process orders
- **Customers**: Can browse products, place orders, and track deliveries

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/grocery-delivery-app.git

# Navigate to backend directory
cd grocery-delivery-app/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API credentials

# Run the development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Run the development server
npm start
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/customer/register` - Register a new customer
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/store/register` - Register a new store owner
- `POST /api/auth/store/login` - Store owner login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add a new product (store owner only)
- `PUT /api/products/:id` - Update a product (store owner only)
- `DELETE /api/products/:id` - Delete a product (store owner only)

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/customer/:id` - Get orders by customer ID
- `GET /api/orders/store/:id` - Get orders by store ID
- `PUT /api/orders/:id` - Update order status

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team Members

- Shreya Rathod
- Tanush Salian
