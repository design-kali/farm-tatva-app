import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminTable } from "./AdminTable";
import { AdminCard } from "./AdminCard";
import { FormDialog } from "./FormDialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Plus, Edit, Trash2 } from "lucide-react";
import { farmTatvaApi, type ApiDeliveryArea } from "@/app/lib/api";
import { readStoredSession } from "@/app/lib/auth";

export default function AdminDeliveryAreas() {
  const [areas, setAreas] = useState<ApiDeliveryArea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ApiDeliveryArea | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    description: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const session = readStoredSession();

    if (!session?.token) {
      setError("Unable to load delivery areas. Please sign in again.");
      setLoading(false);
      return;
    }

    const loadAreas = async () => {
      try {
        const areasRes = await farmTatvaApi.getDeliveryAreas();
        setAreas(areasRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load delivery areas.");
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      description: "",
      isActive: true,
    });
    setEditingArea(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (area: ApiDeliveryArea) => {
    setFormData({
      name: area.name,
      street: area.street,
      city: area.city,
      state: area.state,
      zipCode: area.zipCode,
      description: area.description || "",
      isActive: area.isActive,
    });
    setEditingArea(area);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const session = readStoredSession();
    if (!session?.token) return;

    setSaving(true);
    try {
      const areaData = {
        name: formData.name,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        description: formData.description || null,
        isActive: formData.isActive,
      };

      if (editingArea) {
        const updatedArea = await farmTatvaApi.updateDeliveryArea(session.token, editingArea.id, areaData);
        setAreas(areas.map(a => a.id === editingArea.id ? updatedArea : a));
      } else {
        const newArea = await farmTatvaApi.createDeliveryArea(session.token, areaData);
        setAreas([...areas, newArea]);
      }

      setDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save delivery area.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (areaId: string) => {
    const session = readStoredSession();
    if (!session?.token) return;

    if (!confirm("Are you sure you want to delete this delivery area?")) return;

    try {
      await farmTatvaApi.deleteDeliveryArea(session.token, areaId);
      setAreas(areas.filter(a => a.id !== areaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete delivery area.");
    }
  };

  const filteredAreas = useMemo(
    () =>
      areas.filter((area) =>
        area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.state.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [areas, searchQuery],
  );

  const columns = [
    {
      key: "name",
      header: "Area",
    },
    {
      key: "city",
      header: "City",
    },
    {
      key: "state",
      header: "State",
    },
    {
      key: "zipCode",
      header: "Zip Code",
    },
    {
      key: "isActive",
      header: "Active",
      render: (value: boolean) => (value ? "Yes" : "No"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: any, row: ApiDeliveryArea) => (
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
        title="Delivery Area Management"
        description="Manage delivery zones and areas."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Area
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
            <div className="text-2xl font-bold text-blue-600">{loading ? "..." : areas.length}</div>
            <p className="text-sm text-gray-600">Delivery Zones</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{loading ? "..." : areas.filter((area) => area.isActive).length}</div>
            <p className="text-sm text-gray-600">Active Areas</p>
          </div>
        </AdminCard>
      </div>

      <AdminTable
        title="Delivery Areas"
        columns={columns}
        data={filteredAreas}
        searchable
        onSearch={setSearchQuery}
        loading={loading}
        emptyMessage={loading ? "Loading areas..." : "No delivery areas match your search."}
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingArea ? "Edit Delivery Area" : "Add Delivery Area"}
        description={editingArea ? "Update delivery area information" : "Create a new delivery area"}
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel={editingArea ? "Update" : "Create"}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Area Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Area name"
              required
            />
          </div>
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Street address"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="Zip code"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
