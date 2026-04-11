import { createCategory, getCategories } from "./category.service.js";

export const addCategory = async (req, res) => {
  try {
    const category = await createCategory(req.body);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listCategories = async (req, res) => {
  const categories = await getCategories();
  res.json(categories);
};
