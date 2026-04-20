import { createCategory, getCategories, updateCategory, deleteCategory } from "./category.service.js";

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

export const editCategory = async (req, res) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeCategory = async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
