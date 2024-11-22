import Product from '../models/productModel.js';

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const addProduct = async (req, res) => {
    const { name, price, stock } = req.body;
    try {
        const product = await Product.create({ name, price, stock });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndDelete(id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
