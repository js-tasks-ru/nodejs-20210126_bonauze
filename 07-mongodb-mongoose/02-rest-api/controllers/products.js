const mongoose = require('mongoose');
const Product = require('../models/Product');

const INVALID_ID_MESSAGE = 'Invalid ID';
const NOT_FOUND_MESSAGE = 'Not found';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const transferProductData = (product) => {
  const { _id, title, images, category, subcategory, price, description } = product;
  const result = {
    id: _id,
    title,
    category,
    subcategory,
    price,
    description,
  };

  if (images) {
    result.images = images;
  }

  return result
};

module.exports.handleInvalidObjectId = async function handleInvalidObjectId(ctx, next) {
  const { id } = ctx.params;

  if (id && !isValidId(id)) {
    ctx.status = 400;
    ctx.body = INVALID_ID_MESSAGE;
  } else {
    await next();
  }
};

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const id = ctx.query.subcategory;

  if (!id) {
    await next();
    return;
  }

  if (!isValidId(id)) {
    ctx.status = 400;
    ctx.body = INVALID_ID_MESSAGE;
    return;
  }

  const products = await Product.find({ subcategory: id });
  ctx.body = { products: products.map(transferProductData) };
};

module.exports.productList = async function productList(ctx) {
  const products = await Product.find();
  ctx.body = { products: products.map(transferProductData) };
};

module.exports.productById = async function productById(ctx) {
  const product = await Product.findOne({ _id: ctx.params.id })

  if (!product) {
    ctx.status = 404;
    ctx.body = NOT_FOUND_MESSAGE;
  } else {
    ctx.body = { product: transferProductData(product) };
  }
};

