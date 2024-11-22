import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product
                quantity: { type: Number, required: true }, // Quantity of the product in the cart
            },
        ],
        total: { type: Number, default: 0 }, // Optional, total price of the cart (calculated dynamically)
    },
    { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
