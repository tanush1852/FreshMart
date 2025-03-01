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
![image](https://github.com/user-attachments/assets/04431460-774e-4ba7-9813-0ff6369772c4)


### Customer Interface
![Customer Sign-Up](https://placeholder-image.com/customer-signup.png)
*Streamlined account creation process*

![Customer Login](https://placeholder-image.com/customer-login.png)
*Secure customer authentication*

![Shopping Page](https://placeholder-image.com/shopping-page.png)
*Product browsing interface with search and filter capabilities*

![Shopping Cart](https://placeholder-image.com/shopping-cart.png)
*Interactive cart experience with quantity adjustments*

![Payment Options](https://placeholder-image.com/payment-options.png)
*Flexible payment method selection*

![Order Success](https://placeholder-image.com/order-success.png)
*Confirmation page with intelligent delivery time estimation*

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
