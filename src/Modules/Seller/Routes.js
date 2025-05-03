import { Router } from "express";
import { register, index, store, show, update, destroy, updateAsAdmin } from "./Seller.Controller.js";
const router = Router();

router.get("/", index);
router.post("/create", store);
router.get("/show/:slug", show);
router.put("/update/:slug", update);
router.delete("/delete/:slug", destroy);
router.post("/register", register);
router.put("/update-as-admin/:slug", updateAsAdmin);

export default router;