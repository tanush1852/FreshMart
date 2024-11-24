import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShoppingBasket, 
  LogOut, 
  ShoppingCart,
  Package,
  Trash2
} from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null); // Default state as null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
      } else {
        throw new Error(data.message || 'Failed to fetch cart');
      }
    } catch (err) {
      setError('Failed to fetch cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Order created successfully');
        setCart(null);  // Clear the cart after placing the order
      } else {
        throw new Error(data.message || 'Failed to create order');
      }
    } catch (err) {
      setError('Failed to create order');
      console.error(err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/remove', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);  // Update cart after item removal
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
    } catch (err) {
      setError('Failed to remove item');
      console.error(err);
    }
  };

  const handleClearCart = async () => {
    try {
      setLoading(true);  // Show loading indicator while the request is in progress
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        return;
      }

      // Make the DELETE request to clear the cart
      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',  // Use DELETE method for clearing cart
        headers: {
          'Authorization': `Bearer ${token}`,  // Pass the token in the Authorization header
        },
      });

      // Parse the response
      const data = await response.json();

      if (response.ok) {
        // On success, clear the cart and show success message
        setCart(null);  // Clear the cart state
        setSuccessMessage(data.message);  // Show success message
      } else {
        // If the response is not successful, show the error message
        setError(data.message || 'Failed to clear the cart');
      }
    } catch (err) {
      // Handle network or unexpected errors
      setError('An error occurred while clearing the cart');
      console.error(err);
    } finally {
      setLoading(false);  // Reset loading state
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <ShoppingBasket className="h-8 w-8" />
              <h1 className="text-2xl font-bold">My Cart</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Control Panel (Clear Cart, Place Order) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Button 
            onClick={handleClearCart}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            disabled={loading || !cart || cart.products.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
          <Button 
            onClick={handlePlaceOrder}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            disabled={loading || !cart || cart.products.length === 0}
          >
            <Package className="h-4 w-4 mr-2" />
            Place Order
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-6">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Cart Grid */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-8">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            </Card>
          ) : (
            cart && cart.products ? (
              <Card key={cart._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold">Your Cart</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(cart.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Cart Items</h4>
                        <div className="space-y-1">
                          {cart.products.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.product.name}</span>
                              <span>x{item.quantity}</span>
                              <Button 
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleRemoveItem(item.product._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h4>
                        <span className="text-lg font-bold text-green-600">
                          ${cart.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  No items in the cart
                </div>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
