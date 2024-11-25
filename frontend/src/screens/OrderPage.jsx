import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ShoppingBasket, 
  LogOut, 
  ShoppingCart,
  Package,
  Trash2,
  CreditCard,
  Truck
} from 'lucide-react';
import dropin from 'braintree-web-drop-in';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [braintreeInstance, setBraintreeInstance] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  // Cleanup Braintree instance when dialog closes
  useEffect(() => {
    if (!showPaymentDialog && braintreeInstance) {
      braintreeInstance.teardown();
      setBraintreeInstance(null);
    }
  }, [showPaymentDialog]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const initializeBraintree = async () => {
    try {
      if (!cart?._id) return;
      
      const response = await fetch(`http://localhost:5000/api/orders/pay/card`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get payment token');
      }

      const data = await response.json();

      const instance = await dropin.create({
        authorization: data.clientToken,
        container: '#braintree-drop-in-container',
        card: {
          vault: {
            allowVaultCardOverride: true
          }
        }
      });

      setBraintreeInstance(instance);
    } catch (err) {
      setError('Failed to initialize payment system');
      console.error(err);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (paymentMethod === 'cod') {
        await handlePlaceOrder('cod');
      } else if (paymentMethod === 'card' && braintreeInstance) {
        const { nonce } = await braintreeInstance.requestPaymentMethod();
        await handlePlaceOrder('card', nonce);
      }
    } catch (err) {
      setError('Payment processing failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (paymentType, paymentNonce = null) => {
    try {
      const orderData = {
        paymentType,
        cartId: cart._id,
        ...(paymentNonce && { paymentNonce })
      };

      const response = await fetch('http://localhost:5000/api/cart/order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Order placed successfully!');
        setCart(null);
        setShowPaymentDialog(false);
        // Clear braintree instance
        if (braintreeInstance) {
          braintreeInstance.teardown();
          setBraintreeInstance(null);
        }
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
      setError('Failed to remove item');
      console.error('Remove item error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch cart');
      }
    } catch (err) {
      console.error('Fetch cart error:', err);
      setError('Failed to fetch cart');
    }
  };

  const handleClearCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCart(null);
        setSuccessMessage(data.message);
      } else {
        throw new Error(data.message || 'Failed to clear the cart');
      }
    } catch (err) {
      setError('An error occurred while clearing the cart');
      console.error(err);
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
        {/* Control Panel (Clear Cart, Place Order) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Button 
            onClick={handleClearCart}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            disabled={loading || !cart || cart.products?.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                disabled={loading || !cart || cart.products?.length === 0}
                onClick={() => {
                  setShowPaymentDialog(true);
                  setPaymentMethod('');
                  setError(null);
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                Place Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={async (value) => {
                    setPaymentMethod(value);
                    if (value === 'card') {
                      await initializeBraintree();
                    }
                  }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Cash on Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with Card
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div id="braintree-drop-in-container" className="mt-4" />
                )}

                <Button 
                  onClick={handlePayment}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || !paymentMethod}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </div>
                  ) : (
                    paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
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