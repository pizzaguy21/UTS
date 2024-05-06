const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const productRoutes = require('./components/products/product-route');

module.exports = () => {
  const app = express.Router();

  // Gunakan rute produk
  app.use('/api/products', productRoutes);

  // Gunakan rute authentication
  authentication(app);

  // Gunakan rute users
  users(app);

  return app;
};
