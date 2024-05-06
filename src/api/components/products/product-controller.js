const { celebrate } = require('celebrate');
const productValidator = require('./product-validator');
const productService = require('./product-service');

async function createProduct(req, res) {
  try {
    celebrate(productValidator.createProduct, req);
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function getProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const product = await productService.getProduct(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    next(error);
  }
}
async function getProducts(req, res, next) {
  try {
    const products = await productService.getProducts();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const product = await productService.getProduct(productId);
    if (!product) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Product not found'
      );
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const { name, description, price, origin } = req.body;
    const updatedProduct = await productService.updateProduct(
      productId,
      name,
      description,
      price,
      origin
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const productId = req.params.id;
    await productService.deleteProduct(productId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
