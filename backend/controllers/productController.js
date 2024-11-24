import Product from '../models/productModel.js';

export const getProducts = async (req, res) => {
    try {
        const storeOwnerId = req.user._id;
        const products = await Product.find({ storeOwner: storeOwnerId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('storeOwner', 'name email')
            .sort({ createdAt: -1 });
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
        const product = await Product.create({ 
            name, 
            price, 
            stock,
            storeOwner: req.user._id
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findOne({ 
            _id: id, 
            storeOwner: req.user._id 
        });

        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found or you don\'t have permission to update it' 
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findOne({ 
            _id: id, 
            storeOwner: req.user._id 
        });

        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found or you don\'t have permission to delete it' 
            });
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
