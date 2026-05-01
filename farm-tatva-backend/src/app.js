import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import addressRoutes from "./modules/address/address.routes.js";
import deliveryAreaRoutes from "./modules/delivery-area/delivery-area.routes.js";
import userRoutes from "./modules/user/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/delivery-areas", deliveryAreaRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Farm Tatva Backend Running 🚀");
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler (includes async errors in Express 5)
app.use((err, req, res, next) => {
  const status = Number(err?.statusCode || err?.status || 500);
  const message =
    status >= 500 ? "Internal server error" : err?.message || "Request failed";

  if (status >= 500) {
    console.error("[error]", err);
  }

  if (res.headersSent) return;
  res.status(status).json({ error: message });
});

export default app;
