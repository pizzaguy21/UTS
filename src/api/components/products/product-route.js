const express = require('express');
const router = express.Router();
const productController = require('./product-controller');
const { celebrate } = require('celebrate');
const productValidator = require('./product-validator');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');

router.post(
  '/',
  authenticationMiddleware,
  celebrate(productValidator.createProduct),
  productController.createProduct
);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.put(
  '/:id',
  authenticationMiddleware,
  celebrate(productValidator.updateProduct),
  productController.updateProduct
);
router.delete(
  '/:id',
  authenticationMiddleware,
  productController.deleteProduct
);

module.exports = router;
