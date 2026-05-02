import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductImages,
} from "./product.service.js";
import {
  getRelativeImagePath,
  deleteUploadedFile,
  getAbsoluteFilePath,
} from "../../middlewares/upload.middleware.js";
import fs from "fs";
import path from "path";

export const addProduct = async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const uploadProductImages = async (req, res) => {
  try {
    const { id: productId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Verify product exists
    const product = await getProductById(productId);
    if (!product) {
      // Clean up uploaded files if product doesn't exist
      req.files.forEach((file) => {
        deleteUploadedFile(productId, file.filename);
      });
      return res.status(404).json({ error: "Product not found" });
    }

    // Verify all files exist on disk before saving to database
    const filesToSave = [];
    const uploadedFileErrors = [];

    console.log(`[UPLOAD] Validating ${req.files.length} file(s) for product ${productId}`);

    for (const file of req.files) {
      const absolutePath = getAbsoluteFilePath(productId, file.filename);
      const fileExists = fs.existsSync(absolutePath);

      console.log(`[UPLOAD] Checking file: ${file.filename}`);

      if (!fileExists) {
        console.error(`[UPLOAD] ✗ File not found on disk: ${absolutePath}`);
        uploadedFileErrors.push(`File ${file.filename} not found on disk`);
      } else {
        // Verify file is not empty
        const stats = fs.statSync(absolutePath);
        const relativePath = getRelativeImagePath(productId, file.filename);

        if (stats.size === 0) {
          console.error(`[UPLOAD] ✗ File is empty: ${absolutePath}`);
          deleteUploadedFile(productId, file.filename);
          uploadedFileErrors.push(`File ${file.filename} is empty`);
        } else {
          console.log(`[UPLOAD] ✓ File verified | Size: ${stats.size} bytes | Path: ${relativePath}`);
          filesToSave.push({
            productId,
            imageUrl: relativePath,
            filename: file.filename, // Keep track of filename for rollback
          });
        }
      }
    }

    // If any files failed verification, don't save anything to database
    if (uploadedFileErrors.length > 0) {
      // Cleanup any successful files too for consistency
      filesToSave.forEach((file) => {
        deleteUploadedFile(productId, file.filename);
      });

      return res.status(400).json({
        error: "File verification failed",
        details: uploadedFileErrors,
        message: `${uploadedFileErrors.length} file(s) failed validation. No images were saved.`,
      });
    }

    // All files verified - now save to database
    if (filesToSave.length === 0) {
      return res.status(400).json({
        error: "No valid files to upload",
      });
    }

    console.log(`[UPLOAD] All ${filesToSave.length} file(s) verified. Preparing database save...`);
    filesToSave.forEach((f, idx) => {
      const absolutePath = getAbsoluteFilePath(productId, f.filename);
      const stats = fs.statSync(absolutePath);
      console.log(`[UPLOAD]   [${idx + 1}] ${f.imageUrl} (${stats.size} bytes)`);
    });

    // Remove filename field before saving to database
    const imageDataForDb = filesToSave.map(({ filename, ...data }) => data);

    try {
      const uploadedImages = await addProductImages(productId, imageDataForDb);

      console.log(`[UPLOAD] ✓ Database save successful! Saved ${uploadedImages.length} image(s) for product ID: ${productId}`);
      uploadedImages.forEach((img, idx) => {
        console.log(`[UPLOAD]   [${idx + 1}] Image ID: ${img.id} | URL: ${img.imageUrl}`);
      });

      res.json({
        success: true,
        message: `${uploadedImages.length} image(s) uploaded successfully`,
        images: uploadedImages,
      });
    } catch (dbError) {
      console.error(
        `[UPLOAD] ✗ Database save failed for product ${productId}:`,
        dbError.message,
      );
      // If database save fails, clean up uploaded files
      filesToSave.forEach((file) => {
        console.log(`[UPLOAD] Rolling back file: ${file.imageUrl}`);
        deleteUploadedFile(productId, file.filename);
      });

      throw new Error(`Database save failed: ${dbError.message}`);
    }
  } catch (err) {
    res.status(500).json({
      error: err.message,
      type: "upload_error",
    });
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
    console.log(err);
    
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
