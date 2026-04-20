import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./product.service.js";

export const addProduct = async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listProducts = async (req, res) => {
  const products = await getProducts();
  res.json(products);
};

export const getProduct = async (req, res) => {
  const product = await getProductById(req.params.id);
  res.json(product);
};

export const editProduct = async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeProduct = async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
