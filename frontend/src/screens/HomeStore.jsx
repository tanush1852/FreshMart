import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Plus, LogOut, Trash2, RefreshCw, Edit2 } from "lucide-react";
import { ShoppingBasket } from 'lucide-react';

const HomeStore = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    image: null, // New field for image
  });
  const [editProduct, setEditProduct] = useState(null);

  // Fetch products and ordered products on component mount
  useEffect(() => {
    fetchProducts();
     // Fetch ordered products
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    }
  };

  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = editProduct
      ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/products/${editProduct._id}`
      : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/products`;
    const method = editProduct ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('stock', newProduct.stock);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (editProduct) {
          // Update product in the list
          setProducts(products.map((p) => (p._id === data._id ? data : p)));
        } else {
          // Add new product to the list
          setProducts([...products, data]);
        }
        setNewProduct({ name: '', price: '', stock: '', image: null });
        setEditProduct(null);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: null, // Reset the image field
    });
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter((product) => product._id !== productId));
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <ShoppingBasket className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Store Management</h1>
            </div>
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Add/Edit Product Form */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddOrUpdateProduct} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Product Name</label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="Enter price"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Stock</label>
                  <Input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="Enter stock quantity"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Product Image</label>
                  <Input
                    type="file"
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                    accept="image/*"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading
                    ? editProduct
                      ? 'Updating...'
                      : 'Adding...'
                    : editProduct
                    ? 'Update Product'
                    : 'Add Product'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <Package className="h-5 w-5 mr-2 text-green-600" />
                  Products List
                </h2>
                <Button
                  variant="outline"
                  onClick={fetchProducts}
                  className="text-green-600 hover:text-green-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Price: Rs.{product.price} | Stock: {product.stock}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-center text-gray-500">No products added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          
          
        </div>
      </div>
    </div>
  );
};

export default HomeStore;
