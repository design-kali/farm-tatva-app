import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminTable } from "./AdminTable";
import { AdminCard } from "./AdminCard";
import { FormDialog } from "./FormDialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { farmTatvaApi, type ApiOrder } from "@/app/lib/api";
import { readStoredSession } from "@/app/lib/auth";

export default function AdminOrders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const session = readStoredSession();

    if (!session?.token) {
      setError("Unable to load orders. Please sign in again.");
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      try {
        const ordersRes = await farmTatvaApi.getOrders(session.token);
        setOrders(ordersRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleRefresh = async () => {
    const session = readStoredSession();
    if (!session?.token) return;

    setLoading(true);
    try {
      const ordersRes = await farmTatvaApi.getOrders(session.token);
      setOrders(ordersRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh orders.");
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (order: ApiOrder) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    const session = readStoredSession();
    if (!session?.token || !selectedOrder) return;

    setUpdating(true);
    try {
      const updatedOrder = await farmTatvaApi.updateOrderStatus(session.token, selectedOrder.id, status);
      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      setDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.status.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [orders, searchQuery],
  );

  const getStatusBadge = (status: string) => {
    const normalized = status.replaceAll("_", " ").toLowerCase();
    const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ";

    switch (normalized) {
      case "delivered":
        return `${base} bg-green-100 text-green-700`;
      case "cancelled":
        return `${base} bg-red-100 text-red-700`;
      case "pending":
        return `${base} bg-gray-100 text-gray-700`;
      default:
        return `${base} bg-blue-100 text-blue-700`;
    }
  };

  const columns = [
    {
      key: "id",
      header: "Order ID",
    },
    {
      key: "user",
      header: "Customer",
      render: (_value: any, row: ApiOrder) => row.user?.name ?? row.userId,
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => (
        <span className={getStatusBadge(value)}>{value.replaceAll("_", " ")}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: any, row: ApiOrder) => (
        <Button variant="outline" size="sm" onClick={() => openStatusDialog(row)}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Order Management"
        description="View and manage customer orders."
        actions={
          <Button onClick={handleRefresh}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Refresh
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
            <div className="text-2xl font-bold text-blue-600">{loading ? "..." : orders.length}</div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{loading ? "..." : orders.filter((o) => o.status === "DELIVERED").length}</div>
            <p className="text-sm text-gray-600">Delivered</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{loading ? "..." : orders.filter((o) => o.status === "PENDING").length}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </AdminCard>
      </div>

      <AdminTable
        title="Orders"
        columns={columns}
        data={filteredOrders}
        searchable
        onSearch={setSearchQuery}
        loading={loading}
        emptyMessage={loading ? "Loading orders..." : "No orders match your search."}
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Update Order Status"
        description={`Update status for order ${selectedOrder?.id}`}
        onSubmit={handleUpdateStatus}
        isLoading={updating}
        submitLabel="Update Status"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Order Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PREPARING">Preparing</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
