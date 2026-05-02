import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminTable } from "./AdminTable";
import { AdminCard } from "./AdminCard";
import { FormDialog } from "./FormDialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import {
  farmTatvaApi,
  formatQuantity,
  type ApiCategory,
  type ApiOfferRule,
  type ApiPricingOption,
  type ApiProduct,
} from "@/app/lib/api";
import { readStoredSession } from "@/app/lib/auth";

interface ImageFile {
  file: File;
  preview: string;
}

interface OfferFormRow {
  minQuantity: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: string;
  isActive: boolean;
}

interface PricingOptionFormRow {
  label: string;
  unit: string;
  price: string;
  quantityStep: string;
  minQuantity: string;
  maxQuantity: string;
  inventoryFactor: string;
  isDefault: boolean;
  offers: OfferFormRow[];
}

const createOfferRow = (offer?: ApiOfferRule): OfferFormRow => ({
  minQuantity: offer ? String(offer.minQuantity) : "",
  discountType: offer?.discountType || "PERCENTAGE",
  discountValue: offer ? String(offer.discountValue) : "",
  isActive: offer?.isActive ?? true,
});

const createPricingOptionRow = (
  option?: ApiPricingOption,
  isDefault = false,
): PricingOptionFormRow => ({
  label: option?.label || "",
  unit: option?.unit || "",
  price: option ? String(option.price) : "",
  quantityStep: option ? String(option.quantityStep) : "1",
  minQuantity: option ? String(option.minQuantity) : "1",
  maxQuantity:
    option?.maxQuantity === null || option?.maxQuantity === undefined
      ? ""
      : String(option.maxQuantity),
  inventoryFactor: option ? String(option.inventoryFactor) : "1",
  isDefault: option?.isDefault ?? isDefault,
  offers:
    option?.offers && option.offers.length > 0
      ? option.offers.map(createOfferRow)
      : [],
});

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
    stock: "",
    maxStock: "",
    inventoryUnit: "kg",
    categoryId: "none",
    pricingOptions: [
      createPricingOptionRow(undefined, true),
    ] as PricingOptionFormRow[],
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
    formData.imageFiles.forEach((img) => URL.revokeObjectURL(img.preview));
    setFormData({
      name: "",
      description: "",
      stock: "",
      maxStock: "",
      inventoryUnit: "kg",
      categoryId: "none",
      pricingOptions: [createPricingOptionRow(undefined, true)],
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
      stock: String(product.stock),
      maxStock: String(product.maxStock),
      inventoryUnit: product.inventoryUnit || "kg",
      categoryId: product.categoryId || "none",
      pricingOptions:
        product.pricingOptions && product.pricingOptions.length > 0
          ? product.pricingOptions.map((option) =>
              createPricingOptionRow(option),
            )
          : [createPricingOptionRow(undefined, true)],
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

    setFormData((current) => ({
      ...current,
      imageFiles: [...current.imageFiles, ...newImages],
    }));

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(formData.imageFiles[index].preview);
    setFormData((current) => ({
      ...current,
      imageFiles: current.imageFiles.filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    }));
  };

  const updatePricingOption = (
    optionIndex: number,
    field: keyof PricingOptionFormRow,
    value: string | boolean | OfferFormRow[],
  ) => {
    setFormData((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option, index) =>
        index === optionIndex ? { ...option, [field]: value } : option,
      ),
    }));
  };

  const setDefaultOption = (optionIndex: number) => {
    setFormData((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option, index) => ({
        ...option,
        isDefault: index === optionIndex,
      })),
    }));
  };

  const addPricingOption = () => {
    setFormData((current) => ({
      ...current,
      pricingOptions: [
        ...current.pricingOptions,
        createPricingOptionRow(undefined, current.pricingOptions.length === 0),
      ],
    }));
  };

  const removePricingOption = (optionIndex: number) => {
    setFormData((current) => {
      const nextOptions = current.pricingOptions.filter(
        (_, index) => index !== optionIndex,
      );

      return {
        ...current,
        pricingOptions:
          nextOptions.length === 0
            ? [createPricingOptionRow(undefined, true)]
            : nextOptions.some((option) => option.isDefault)
              ? nextOptions
              : nextOptions.map((option, index) => ({
                  ...option,
                  isDefault: index === 0,
                })),
      };
    });
  };

  const addOffer = (optionIndex: number) => {
    setFormData((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option, index) =>
        index === optionIndex
          ? { ...option, offers: [...option.offers, createOfferRow()] }
          : option,
      ),
    }));
  };

  const updateOffer = (
    optionIndex: number,
    offerIndex: number,
    field: keyof OfferFormRow,
    value: string | boolean,
  ) => {
    setFormData((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option, index) =>
        index === optionIndex
          ? {
              ...option,
              offers: option.offers.map((offer, currentOfferIndex) =>
                currentOfferIndex === offerIndex
                  ? { ...offer, [field]: value }
                  : offer,
              ),
            }
          : option,
      ),
    }));
  };

  const removeOffer = (optionIndex: number, offerIndex: number) => {
    setFormData((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option, index) =>
        index === optionIndex
          ? {
              ...option,
              offers: option.offers.filter(
                (_, currentOfferIndex) => currentOfferIndex !== offerIndex,
              ),
            }
          : option,
      ),
    }));
  };

  const uploadProductImages = async (productId: string, files: File[]) => {
    const session = readStoredSession();
    if (!session?.token || files.length === 0) return;

    const formDataFiles = new FormData();
    files.forEach((file) => formDataFiles.append("images", file));

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/products/${productId}/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: formDataFiles,
      },
    );

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
        stock: parseFloat(formData.stock),
        maxStock: parseFloat(formData.maxStock),
        inventoryUnit: formData.inventoryUnit,
        categoryId:
          formData.categoryId === "none" ? null : formData.categoryId || null,
        pricingOptions: formData.pricingOptions.map((option, optionIndex) => ({
          label: option.label,
          unit: option.unit,
          price: parseFloat(option.price),
          quantityStep: parseFloat(option.quantityStep),
          minQuantity: parseFloat(option.minQuantity),
          maxQuantity:
            option.maxQuantity.trim().length > 0
              ? parseFloat(option.maxQuantity)
              : null,
          inventoryFactor: parseFloat(option.inventoryFactor),
          sortOrder: optionIndex,
          isDefault: option.isDefault,
          offers: option.offers.map((offer) => ({
            minQuantity: parseFloat(offer.minQuantity),
            discountType: offer.discountType,
            discountValue: parseFloat(offer.discountValue),
            isActive: offer.isActive,
          })),
        })),
      };

      let product;
      if (editingProduct) {
        product = await farmTatvaApi.updateProduct(
          session.token,
          editingProduct.id,
          productData,
        );
        setProducts((current) =>
          current.map((row) => (row.id === editingProduct.id ? product : row)),
        );
      } else {
        product = await farmTatvaApi.createProduct(session.token, productData);
        setProducts((current) => [...current, product]);
      }

      if (formData.imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          const imageFiles = formData.imageFiles.map((img) => img.file);
          await uploadProductImages(product.id, imageFiles);
          const updatedProduct = await farmTatvaApi.getProduct(product.id);
          setProducts((current) =>
            current.map((row) =>
              row.id === product.id ? updatedProduct : row,
            ),
          );
        } catch (err) {
          setError(
            "Product saved but image upload failed: " +
              (err instanceof Error ? err.message : "Unknown error"),
          );
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
      setProducts((current) =>
        current.filter((product) => product.id !== productId),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete product.",
      );
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
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
          <p className="text-sm text-gray-600">
            {row.category?.name ?? "Uncategorized"}
          </p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Pricing",
      render: (_value: number, row: ApiProduct) => {
        const defaultOption =
          row.defaultPricingOption ||
          row.pricingOptions?.find((option) => option.isDefault) ||
          row.pricingOptions?.[0];

        return defaultOption
          ? `Rs ${defaultOption.price.toFixed(2)}/${defaultOption.unit}`
          : "No pricing";
      },
    },
    {
      key: "stock",
      header: "Inventory",
      render: (value: number, row: ApiProduct) => (
        <span className={value > 10 ? "text-green-600" : "text-orange-600"}>
          {formatQuantity(value)} {row.inventoryUnit || "unit"}
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
      render: (_value: unknown, row: ApiProduct) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(row)}
          >
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
        description="Manage products, inventory, pricing options, and bulk offers."
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
            <div className="text-2xl font-bold text-blue-600">
              {loading ? "..." : products.length}
            </div>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {loading
                ? "..."
                : products.filter((product) => product.stock > 0).length}
            </div>
            <p className="text-sm text-gray-600">In Stock</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {loading
                ? "..."
                : products.filter((product) => product.stock <= 10).length}
            </div>
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
        emptyMessage={
          loading
            ? "Loading products..."
            : "No products found matching your search."
        }
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingProduct ? "Edit Product" : "Add Product"}
        description={
          editingProduct
            ? "Update product information, unit pricing, and offers."
            : "Create a new product with flexible pricing."
        }
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel={editingProduct ? "Update" : "Create"}
        contentClassName="w-[min(96vw,1100px)] max-w-[1100px] max-h-[92vh] p-0 overflow-hidden"
        bodyClassName="space-y-6 px-6 pb-6"
        footerClassName="border-t bg-white px-6 pb-6 pt-4"
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#1B4332]/10 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#1B4332]">
                Product Basics
              </h3>
              <p className="text-sm text-gray-500">
                Start with the core catalog and inventory details.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Product name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Product description"
                    rows={5}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
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
                <div>
                  <Label htmlFor="inventoryUnit">Inventory Unit</Label>
                  <Input
                    id="inventoryUnit"
                    value={formData.inventoryUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inventoryUnit: e.target.value,
                      })
                    }
                    placeholder="kg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Inventory Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    step="0.001"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxStock">Max Stock</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    step="0.001"
                    value={formData.maxStock}
                    onChange={(e) =>
                      setFormData({ ...formData, maxStock: e.target.value })
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-[#1B4332]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1B4332]">
                  Pricing Options
                </h3>
                <p className="text-sm text-gray-500">
                  Define sellable units, purchase steps, and inventory
                  conversion.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPricingOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </div>

            {formData.pricingOptions.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="space-y-5 rounded-2xl border border-[#1B4332]/10 bg-[#F8F4E1]/40 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#1B4332]">
                    Option {optionIndex + 1}
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="radio"
                        checked={option.isDefault}
                        onChange={() => setDefaultOption(optionIndex)}
                      />
                      Default
                    </label>
                    {formData.pricingOptions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePricingOption(optionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={option.label}
                      onChange={(e) =>
                        updatePricingOption(
                          optionIndex,
                          "label",
                          e.target.value,
                        )
                      }
                      placeholder="Per Kg"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={option.unit}
                      onChange={(e) =>
                        updatePricingOption(optionIndex, "unit", e.target.value)
                      }
                      placeholder="kg"
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={option.price}
                      onChange={(e) =>
                        updatePricingOption(
                          optionIndex,
                          "price",
                          e.target.value,
                        )
                      }
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <Label>Quantity Step</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={option.quantityStep}
                      onChange={(e) =>
                        updatePricingOption(
                          optionIndex,
                          "quantityStep",
                          e.target.value,
                        )
                      }
                      placeholder="0.5"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
                  <div>
                    <Label>Min Quantity</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={option.minQuantity}
                      onChange={(e) =>
                        updatePricingOption(
                          optionIndex,
                          "minQuantity",
                          e.target.value,
                        )
                      }
                      placeholder="0.5"
                    />
                  </div>
                  <div>
                    <Label>Max Quantity</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={option.maxQuantity}
                      onChange={(e) =>
                        updatePricingOption(
                          optionIndex,
                          "maxQuantity",
                          e.target.value,
                        )
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label>Inventory Factor</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={option.inventoryFactor}
                      onChange={(e) =>
                        updatePricingOption(
                          optionIndex,
                          "inventoryFactor",
                          e.target.value,
                        )
                      }
                      placeholder="1"
                    />
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-[#1B4332]/70">
                    <p className="font-medium text-[#1B4332]">
                      Inventory usage
                    </p>
                    <p className="mt-1">
                      1 selected unit consumes {option.inventoryFactor || "0"}{" "}
                      {formData.inventoryUnit || "inventory units"}.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1B4332]">
                        Bulk Offers
                      </p>
                      <p className="text-xs text-gray-500">
                        Example: 10% off from 5 kg.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOffer(optionIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Offer
                    </Button>
                  </div>

                  {option.offers.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      No bulk offers for this unit yet.
                    </p>
                  ) : (
                    option.offers.map((offer, offerIndex) => (
                      <div
                        key={`${optionIndex}-${offerIndex}`}
                        className="grid gap-3 rounded-xl border border-[#1B4332]/10 p-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]"
                      >
                        <div>
                          <Label>Min Qty</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={offer.minQuantity}
                            onChange={(e) =>
                              updateOffer(
                                optionIndex,
                                offerIndex,
                                "minQuantity",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={offer.discountType}
                            onValueChange={(value) =>
                              updateOffer(
                                optionIndex,
                                offerIndex,
                                "discountType",
                                value,
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PERCENTAGE">
                                Percentage
                              </SelectItem>
                              <SelectItem value="FLAT">Flat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Value</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={offer.discountValue}
                            onChange={(e) =>
                              updateOffer(
                                optionIndex,
                                offerIndex,
                                "discountValue",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="flex items-center gap-2 text-xs text-gray-600">
                            <input
                              type="checkbox"
                              checked={offer.isActive}
                              onChange={(e) =>
                                updateOffer(
                                  optionIndex,
                                  offerIndex,
                                  "isActive",
                                  e.target.checked,
                                )
                              }
                            />
                            Active
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOffer(optionIndex, offerIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-[#1B4332]/10 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#1B4332]">
                Product Images
              </h3>
              <p className="text-sm text-gray-500">
                Upload supporting visuals for the storefront and admin catalog.
              </p>
            </div>

            <div className="space-y-4">
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
                <label
                  htmlFor="images"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload or drag images
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, WebP, GIF (Max 5MB each, up to 5 images)
                  </span>
                </label>
              </div>

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
          </section>
        </div>
      </FormDialog>
    </div>
  );
}
