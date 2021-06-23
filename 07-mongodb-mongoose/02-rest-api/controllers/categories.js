const Category = require('../models/Category');

const transferCategoriesData = (categories) => {
  return categories.map((category) => ({
    id: category._id,
    title: category.title,
    subcategories: category.subcategories.map((subcategory) => ({
      id: subcategory.id,
      title: subcategory.title,
    })),
  }));
};

module.exports.categoryList = async function categoryList(ctx) {
  const categories = await Category.find();
  ctx.body = { categories: transferCategoriesData(categories) };
};
