import { Router } from "express";

import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import bidRoutes from "./bid.routes";
import categoryRoutes from "./category.routes";
import chatRoutes from "./chat.routes";
import orderRoutes from "./order.routes";
import productRoutes from "./product.routes";
import questionRoutes from "./question.routes";
import ratingRoutes from "./rating.routes";
import sellerRoutes from "./seller.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", bidRoutes);
router.use("/products", productRoutes);
router.use("/seller", sellerRoutes);
router.use("/products", questionRoutes);
router.use("/orders", orderRoutes);
router.use("/orders", chatRoutes);
router.use("/ratings", ratingRoutes);
router.use("/admin", adminRoutes);

export default router;
