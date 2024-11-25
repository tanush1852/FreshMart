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
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [orderProcessing, setOrderProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handlePlaceOrder = async () => {
    try {
      setOrderProcessing(true);
      setError(null);
      setSuccessMessage('');

      // Validate cart state before proceeding
      if (!cart || !cart.products || cart.products.length === 0) {
        throw new Error('Cart is empty');
      }

      const response = await fetch('http://localhost:5000/api/cart/order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Handle successful order creation
      setSuccessMessage(`Order created successfully! ${data.estimatedDeliveryTime ? `Estimated delivery time: ${data.estimatedDeliveryTime}` : ''}`);
      setCart(null);
      
      // Optional: Redirect to orders page after successful creation
      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setOrderProcessing(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setError(null);
      setLoading(true);
  
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
        await fetchCart();
        setSuccessMessage('Item removed successfully');
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
    } catch (err) {
      setError(err.message || 'Failed to remove item');
      console.error('Remove item error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }

      setCart(data);
      setError(null);
    } catch (err) {
      console.error('Fetch cart error:', err);
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authorization token found');
      }

      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear the cart');
      }

      setCart(null);
      setSuccessMessage(data.message);
    } catch (err) {
      setError(err.message || 'An error occurred while clearing the cart');
      console.error('Clear cart error:', err);
    } finally {
      setLoading(false);
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
        {/* Control Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Button 
            onClick={handleClearCart}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            disabled={loading || orderProcessing || !cart || !cart.products || cart.products.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
          <Button 
            onClick={handlePlaceOrder}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            disabled={loading || orderProcessing || !cart || !cart.products || cart.products.length === 0}
          >
            {orderProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Place Order
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
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
          ) : cart && cart.products && cart.products.length > 0 ? (
            <Card className="hover:shadow-md transition-shadow">
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
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="flex-1">{item.product.name}</span>
                            <span className="mx-4">x{item.quantity}</span>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleRemoveItem(item.product._id)}
                              disabled={loading || orderProcessing}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;