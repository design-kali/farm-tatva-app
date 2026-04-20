import { Navigate, RouteObject } from "react-router-dom";
import App from "./App";
import {
  AdminLayout,
  AdminDashboard,
  AdminUsers,
  AdminProducts,
  AdminOrders,
  AdminCategories,
  AdminDeliveryAreas,
  AdminLogin,
} from "./components/admin";
import { RequireAdmin } from "./components/admin/RequireAdmin";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/admin",
    children: [
      {
        index: true,
        element: <Navigate to="login" replace />,
      },
      {
        path: "login",
        element: <AdminLogin />,
      },
      {
        path: "",
        element: (
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "users",
            element: <AdminUsers />,
          },
          {
            path: "products",
            element: <AdminProducts />,
          },
          {
            path: "orders",
            element: <AdminOrders />,
          },
          {
            path: "categories",
            element: <AdminCategories />,
          },
          {
            path: "delivery-areas",
            element: <AdminDeliveryAreas />,
          },
        ],
      },
    ],
  },
];