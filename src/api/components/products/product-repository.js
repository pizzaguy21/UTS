const Product = require('../../../models/index');

async function createProduct(name, description, price, origin) {
  return Product.create({ name, description, price, origin });
}

async function getProducts() {
  return Product.find();
}

async function getProduct(productId) {
  return Product.findById(productId);
}

async function updateProduct(productId, name, description, price, origin) {
  return Product.findByIdAndUpdate(
    productId,
    { name, description, price, origin },
    { new: true }
  );
}

async function deleteProduct(productId) {
  return Product.findByIdAndDelete(productId);
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
