import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, LogIn, ShoppingBasket, Store } from "lucide-react";

const AuthSystem = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    address: '', // Added address field
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!formData.email || !formData.password || !formData.role || (!isLogin && !formData.address)) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin
        ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/login`
        : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/signup`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store the token for subsequent API requests
      localStorage.setItem('token', data.token);

      // Redirect based on the selected role
      if (formData.role === 'customer') {
        navigate('./HomeCust'); // Redirect to customer dashboard
      } else if (formData.role === 'storeOwner') {
        navigate('./HomeStore'); // Redirect to store owner dashboard
      } else {
        throw new Error('Invalid role selected');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-600">
        <div className="w-full h-full flex flex-col justify-center items-center p-12 text-white">
          <ShoppingBasket className="w-24 h-24 mb-8" />
          <h1 className="text-4xl font-bold mb-4">FreshMart</h1>
          <p className="text-xl mb-8 text-center">Your Premium Grocery Shopping Experience</p>
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">24/7 Service</h3>
              <p className="text-sm opacity-90">Always available for you</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">Fresh Products</h3>
              <p className="text-sm opacity-90">Quality guaranteed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm opacity-90">Right to your doorstep</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">Secure Shopping</h3>
              <p className="text-sm opacity-90">Safe & protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-2">
              {isLogin ? (
                <LogIn className="h-10 w-10 text-green-600" />
              ) : (
                <User className="h-10 w-10 text-green-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-center text-gray-600">
              {isLogin ? 'Access your account' : 'Join our community today'}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-9"
                      required={!isLogin}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <Input
                      name="address"
                      placeholder="123 Elm Street, Springfield"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="h-9"
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Account Type</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  required
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <ShoppingBasket className="h-4 w-4" />
                        <span>Customer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="storeOwner">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span>Store Owner</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 h-9"
                disabled={loading}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '', role: '', address: '' });
              }}
              className="text-sm text-green-600 hover:text-green-700 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthSystem;
