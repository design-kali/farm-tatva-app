import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminTable } from "./AdminTable";
import { AdminCard } from "./AdminCard";
import { FormDialog } from "./FormDialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { farmTatvaApi, type ApiOrder, type ApiOrderMeta, type ApiOrderStatusMeta } from "@/app/lib/api";
import { readStoredSession } from "@/app/lib/auth";

export default function AdminOrders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderMeta, setOrderMeta] = useState<ApiOrderMeta | null>(null);
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
        const [ordersRes, orderMetaRes] = await Promise.all([
          farmTatvaApi.getOrders(session.token),
          farmTatvaApi.getOrderMeta(session.token),
        ]);
        setOrders(ordersRes);
        setOrderMeta(orderMetaRes);
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
      const [ordersRes, orderMetaRes] = await Promise.all([
        farmTatvaApi.getOrders(session.token),
        farmTatvaApi.getOrderMeta(session.token),
      ]);
      setOrders(ordersRes);
      setOrderMeta(orderMetaRes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to refresh orders.",
      );
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
      const updatedOrder = await farmTatvaApi.updateOrderStatus(
        session.token,
        selectedOrder.id,
        status,
      );
      setOrders(
        orders.map((o) => (o.id === selectedOrder.id ? updatedOrder : o)),
      );
      setDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update order status.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const orderStatusMap = useMemo(
    () =>
      orderMeta?.orderStatuses.reduce(
        (acc, statusConfig) => ({
          ...acc,
          [statusConfig.value]: statusConfig,
        }),
        {} as Record<string, ApiOrderStatusMeta>,
      ) ?? {},
    [orderMeta],
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = orderStatusMap[status];
    const base =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ";
    return statusConfig
      ? `${base} ${statusConfig.color}`
      : `${base} bg-gray-100 text-gray-700`;
  };

  const availableStatuses = selectedOrder
    ? [
        ...(orderMeta?.validOrderTransitions[selectedOrder.status] || []),
        selectedOrder.status,
      ]
    : [];

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const customerName = order.user?.name?.toLowerCase() ?? "";
      const status = order.status.toLowerCase();
      const orderId = String(order.id).toLowerCase();
      const total = String(order.total).toLowerCase();
      const createdAt = new Date(order.createdAt)
        .toLocaleDateString()
        .toLowerCase();

      return (
        customerName.includes(query) ||
        status.includes(query) ||
        orderId.includes(query) ||
        total.includes(query) ||
        createdAt.includes(query)
      );
    });
  }, [orders, searchQuery]);

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
        <span className={getStatusBadge(value)}>
          {value.replaceAll("_", " ")}
        </span>
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => openStatusDialog(row)}
        >
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
            <div className="text-2xl font-bold text-blue-600">
              {loading ? "..." : orders.length}
            </div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {loading
                ? "..."
                : orders.filter((o) => o.status === "DELIVERED").length}
            </div>
            <p className="text-sm text-gray-600">Delivered</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {loading
                ? "..."
                : orders.filter((o) => o.status === "PENDING").length}
            </div>
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
        emptyMessage={
          loading ? "Loading orders..." : "No orders match your search."
        }
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
                {availableStatuses.map((statusValue) => {
                  const statusConfig = orderStatusMap[statusValue];
                  return (
                    <SelectItem key={statusValue} value={statusValue}>
                      {statusConfig?.label || statusValue}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
