import { Router } from "express";
import { index, store, show, update, destroy, changeStatus } from "./ProductSeller.Controller.js";
const router = Router();

router.get("/:slug", index);
router.post("/create/:slug", store);
router.get("/show/:id", show);
router.put("/update/:id", update);
router.delete("/delete/:id", destroy);
router.put("/change-status/:id", changeStatus);

export default router;