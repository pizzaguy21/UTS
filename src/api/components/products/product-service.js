const productRepository = require('./product-repository');

async function createProduct(req, res) {
  try {
    const newProduct = await productRepository.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function getProducts() {
  return await productRepository.getProducts();
}

async function getProduct(productId) {
  return await productRepository.getProduct(productId);
}

async function updateProduct(productId, name, description, price, origin) {
  return await productRepository.updateProduct(
    productId,
    name,
    description,
    price,
    origin
  );
}

async function deleteProduct(productId) {
  return await productRepository.deleteProduct(productId);
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
