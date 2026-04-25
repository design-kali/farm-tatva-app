import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminTable } from "./AdminTable";
import { AdminCard } from "./AdminCard";
import { FormDialog } from "./FormDialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { farmTatvaApi, type ApiUser } from "@/app/lib/api";
import { readStoredSession } from "@/app/lib/auth";

export default function AdminUsers() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "CUSTOMER",
  });
  const [saving, setSaving] = useState(false);

  const getUserIdentifier = (user: ApiUser) => {
    return user.mobileNumber ?? user.userId ?? user.email ?? "";
  };

  useEffect(() => {
    const session = readStoredSession();

    if (!session?.token) {
      setError("Unable to load users. Please sign in again.");
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        const usersRes = await farmTatvaApi.getUsers(session.token);
        setUsers(usersRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "CUSTOMER",
    });
    setEditingUser(null);
  };

  const openEditDialog = (user: ApiUser) => {
    setFormData({
      name: user.name,
      email: getUserIdentifier(user),
      role: user.role,
    });
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const session = readStoredSession();
    if (!session?.token || !editingUser) return;

    setSaving(true);
    try {
      const updatedUser = await farmTatvaApi.updateUser(session.token, editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    const session = readStoredSession();
    if (!session?.token) return;

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await farmTatvaApi.deleteUser(session.token, userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    }
  };

  const handleToggleRole = async (user: ApiUser) => {
    const session = readStoredSession();
    if (!session?.token) return;

    // Cycle through roles: CUSTOMER -> DELIVERY_AGENT -> ADMIN -> CUSTOMER
    let newRole: string;
    if (user.role === "CUSTOMER") {
      newRole = "DELIVERY_AGENT";
    } else if (user.role === "DELIVERY_AGENT") {
      newRole = "ADMIN";
    } else {
      newRole = "CUSTOMER";
    }

    try {
      const updatedUser = await farmTatvaApi.updateUser(session.token, user.id, { role: newRole });
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user role.");
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getUserIdentifier(user).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, users],
  );

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value: string, row: ApiUser) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {value.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{getUserIdentifier(row)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (value: string) => (
        <Badge variant={value === "ADMIN" ? "default" : value === "DELIVERY_AGENT" ? "secondary" : "outline"}>
          {value.replaceAll("_", " ")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: any, row: ApiUser) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleToggleRole(row)}>
            {row.role === "ADMIN" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
        title="User Management"
        description="Manage users, roles, and permissions across the platform."
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{loading ? "..." : users.length}</div>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{loading ? "..." : users.filter((u) => u.role === "ADMIN").length}</div>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{loading ? "..." : users.filter((u) => u.role === "DELIVERY_AGENT").length}</div>
            <p className="text-sm text-gray-600">Delivery Agents</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{loading ? "..." : users.length}</div>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
        </AdminCard>
      </div>

      <AdminTable
        title="Users"
        columns={columns}
        data={filteredUsers}
        searchable
        onSearch={setSearchQuery}
        loading={loading}
        emptyMessage={loading ? "Loading users..." : "No users found matching your search."}
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Edit User"
        description="Update user information and role"
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel="Update"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="User name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email / Mobile User ID</Label>
            <Input
              id="email"
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com or 9876543210"
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="DELIVERY_AGENT">Delivery Agent</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
