import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminTable } from "./AdminTable";
import { AdminCard } from "./AdminCard";
import { FormDialog } from "./FormDialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { farmTatvaApi, type ApiProduct, type ApiCategory } from "@/app/lib/api";
import { readStoredSession } from "@/app/lib/auth";

interface ImageFile {
  file: File;
  preview: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    maxStock: "",
    categoryId: "none",
    imageFiles: [] as ImageFile[],
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const session = readStoredSession();

    if (!session?.token) {
      setError("Unable to load products. Please sign in again.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          farmTatvaApi.getProducts(),
          farmTatvaApi.getCategories(),
        ]);
        setProducts(productsRes);
        setCategories(categoriesRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const resetForm = () => {
    formData.imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      maxStock: "",
      categoryId: "none",
      imageFiles: [],
    });
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (product: ApiProduct) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      maxStock: product.maxStock.toString(),
      categoryId: product.categoryId || "none",
      imageFiles: [],
    });
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newImages: ImageFile[] = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData({
      ...formData,
      imageFiles: [...formData.imageFiles, ...newImages],
    });

    // Reset input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(formData.imageFiles[index].preview);
    setFormData({
      ...formData,
      imageFiles: formData.imageFiles.filter((_, i) => i !== index),
    });
  };

  const uploadProductImages = async (productId: string, files: File[]) => {
    const session = readStoredSession();
    if (!session?.token || files.length === 0) return;

    const formDataFiles = new FormData();
    files.forEach((file) => formDataFiles.append("images", file));

    const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      body: formDataFiles,
    });

    if (!response.ok) {
      throw new Error("Failed to upload images");
    }

    return response.json();
  };

  const handleSubmit = async () => {
    const session = readStoredSession();
    if (!session?.token) return;

    setSaving(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        maxStock: parseInt(formData.maxStock),
        categoryId: formData.categoryId === "none" ? null : formData.categoryId || null,
      };

      let product;
      if (editingProduct) {
        product = await farmTatvaApi.updateProduct(session.token, editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? product : p));
      } else {
        product = await farmTatvaApi.createProduct(session.token, productData);
        setProducts([...products, product]);
      }

      // Upload images if any
      if (formData.imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          const imageFiles = formData.imageFiles.map(img => img.file);
          await uploadProductImages(product.id, imageFiles);
          
          // Refresh product data to get uploaded images
          const updatedProduct = await farmTatvaApi.getProduct(product.id);
          setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
        } catch (err) {
          setError("Product created but image upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
        } finally {
          setUploadingImages(false);
        }
      }

      setDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    const session = readStoredSession();
    if (!session?.token) return;

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await farmTatvaApi.deleteProduct(session.token, productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  );

  const columns = [
    {
      key: "name",
      header: "Product",
      render: (value: string, row: ApiProduct) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{row.category?.name ?? "Uncategorized"}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: "stock",
      header: "Stock",
      render: (value: number) => (
        <span className={value > 10 ? "text-green-600" : "text-orange-600"}>
          {value}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Added",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: any, row: ApiProduct) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Product Management"
        description="Manage products, inventory, and pricing."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        }
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{loading ? "..." : products.length}</div>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{loading ? "..." : products.filter((product) => product.stock > 0).length}</div>
            <p className="text-sm text-gray-600">In Stock</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{loading ? "..." : products.filter((product) => product.stock <= 10).length}</div>
            <p className="text-sm text-gray-600">Low Stock</p>
          </div>
        </AdminCard>
      </div>

      <AdminTable
        title="Products"
        columns={columns}
        data={filteredProducts}
        searchable
        onSearch={setSearchQuery}
        loading={loading}
        emptyMessage={loading ? "Loading products..." : "No products found matching your search."}
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingProduct ? "Edit Product" : "Add Product"}
        description={editingProduct ? "Update product information" : "Create a new product"}
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel={editingProduct ? "Update" : "Create"}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product name"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxStock">Max Stock</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="images">Product Images</Label>
            <div className="space-y-4">
              {/* File Upload Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploadingImages}
                />
                <label htmlFor="images" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload or drag images
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, WebP, GIF (Max 5MB each, up to 5 images)
                  </span>
                </label>
              </div>

              {/* Image Previews */}
              {formData.imageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.imageFiles.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadingImages && (
                <div className="text-sm text-blue-600 font-medium">
                  Uploading images...
                </div>
              )}
            </div>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
