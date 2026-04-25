import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminStatsCard } from "./AdminStatsCard";
import { AdminCard } from "./AdminCard";
import { Button } from "@/app/components/ui/button";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { farmTatvaApi, type ApiOrder, type ApiProduct, type ApiUser, type ApiOrderMeta } from "@/app/lib/api";
import { readStoredSession } from "@/app/lib/auth";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [orderMeta, setOrderMeta] = useState<ApiOrderMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = readStoredSession();

    if (!session?.token) {
      setError("Unable to load dashboard data. Please sign in again.");
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        const [usersRes, productsRes, ordersRes, orderMetaRes] = await Promise.all([
          farmTatvaApi.getUsers(session.token),
          farmTatvaApi.getProducts(),
          farmTatvaApi.getOrders(session.token),
          farmTatvaApi.getOrderMeta(session.token),
        ]);

        setUsers(usersRes);
        setProducts(productsRes);
        setOrders(ordersRes);
        setOrderMeta(orderMetaRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const lowStockItems = products
    .filter((product) => product.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3)
    .map((product) => ({
      name: product.name,
      stock: product.stock,
      threshold: 10,
    }));

  const orderStatusMap = useMemo(
    () =>
      orderMeta?.orderStatuses.reduce(
        (acc, statusConfig) => ({
          ...acc,
          [statusConfig.value]: statusConfig,
        }),
        {} as Record<string, { value: string; label: string; color: string }>,
      ) ?? {},
    [orderMeta],
  );

  const getStatusColor = (status: string) => {
    const statusConfig = orderStatusMap[status];
    return statusConfig?.color || "text-gray-600 bg-gray-100";
  };

  const dashboardStats = [
    {
      title: "Total Users",
      value: loading ? "..." : `${users.length}`,
      icon: Users,
      color: "text-blue-600",
      trend: { value: 0, label: "since last refresh", isPositive: true },
    },
    {
      title: "Total Products",
      value: loading ? "..." : `${products.length}`,
      icon: Package,
      color: "text-green-600",
      trend: { value: 0, label: "since last refresh", isPositive: true },
    },
    {
      title: "Total Orders",
      value: loading ? "..." : `${orders.length}`,
      icon: ShoppingCart,
      color: "text-orange-600",
      trend: { value: 0, label: "since last refresh", isPositive: true },
    },
    {
      title: "Revenue",
      value: loading ? "..." : `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600",
      trend: { value: 0, label: "since last refresh", isPositive: true },
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Welcome to the Farm Tatva admin panel. Here's an overview of your business."
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat) => (
          <AdminStatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard
          title="Recent Orders"
          headerAction={
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate("/admin/orders")}>
              View All
            </Button>
          }
        >
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No orders yet.</div>
            ) : (
              orders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {order.user?.name ?? "Unknown Customer"}
                      </p>
                      <p className="truncate text-sm text-gray-600">
                        {order.id} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-medium text-gray-900">₹{order.total.toFixed(2)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        <AdminCard
          title="Low Stock Alerts"
          headerAction={
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate("/admin/products")}>
              Manage Inventory
            </Button>
          }
        >
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading stock data...</div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-center py-10 text-gray-500">All products have healthy stock levels.</div>
            ) : (
              lowStockItems.map((item, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.stock} remaining (threshold: {item.threshold})
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    Restock
                  </Button>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Quick Actions" className="mt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Button className="h-20 flex flex-col items-center justify-center space-y-2">
            <Package className="h-6 w-6" />
            <span>Add New Product</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <Users className="h-6 w-6" />
            <span>Manage Users</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <ShoppingCart className="h-6 w-6" />
            <span>Process Orders</span>
          </Button>
        </div>
      </AdminCard>
    </div>
  );
}
