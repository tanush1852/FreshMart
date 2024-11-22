import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {String} id - User's ID
 * @returns {String} - Signed JWT token
 */
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token validity
    });
};

/**
 * Custom error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

/**
 * Format order summary
 * @param {Array} products - Array of product objects
 * @returns {String} - Formatted order summary
 */
export const formatOrderSummary = (products) => {
    return products
        .map((item) => `${item.quantity}x ${item.product.name}`)
        .join(', ');
};
