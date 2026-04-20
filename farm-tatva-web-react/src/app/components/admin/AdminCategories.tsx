import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminTable } from "./AdminTable";
import { AdminCard } from "./AdminCard";
import { FormDialog } from "./FormDialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { farmTatvaApi, type ApiCategory } from "@/app/lib/api";
import { readStoredSession } from "@/app/lib/auth";

export default function AdminCategories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const session = readStoredSession();

    if (!session?.token) {
      setError("Unable to load categories. Please sign in again.");
      setLoading(false);
      return;
    }

    const loadCategories = async () => {
      try {
        const categoriesRes = await farmTatvaApi.getCategories();
        setCategories(categoriesRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load categories.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const resetForm = () => {
    setFormData({ name: "" });
    setEditingCategory(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (category: ApiCategory) => {
    setFormData({ name: category.name });
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const session = readStoredSession();
    if (!session?.token) return;

    setSaving(true);
    try {
      if (editingCategory) {
        const updatedCategory = await farmTatvaApi.updateCategory(session.token, editingCategory.id, { name: formData.name });
        setCategories(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
      } else {
        const newCategory = await farmTatvaApi.createCategory(session.token, { name: formData.name });
        setCategories([...categories, newCategory]);
      }

      setDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    const session = readStoredSession();
    if (!session?.token) return;

    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await farmTatvaApi.deleteCategory(session.token, categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category.");
    }
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [categories, searchQuery],
  );

  const columns = [
    {
      key: "name",
      header: "Category",
    },
    {
      key: "createdAt",
      header: "Created",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: any, row: ApiCategory) => (
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
        title="Category Management"
        description="Manage product categories."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
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
            <div className="text-2xl font-bold text-blue-600">{loading ? "..." : categories.length}</div>
            <p className="text-sm text-gray-600">Total Categories</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{loading ? "..." : categories.length}</div>
            <p className="text-sm text-gray-600">Active Categories</p>
          </div>
        </AdminCard>
      </div>

      <AdminTable
        title="Categories"
        columns={columns}
        data={filteredCategories}
        searchable
        onSearch={setSearchQuery}
        loading={loading}
        emptyMessage={loading ? "Loading categories..." : "No categories match your search."}
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingCategory ? "Edit Category" : "Add Category"}
        description={editingCategory ? "Update category information" : "Create a new category"}
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel={editingCategory ? "Update" : "Create"}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Category name"
              required
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
