import { Router } from "express";
import { register, index, store, show, update, destroy, changeStatus } from "./Seller.Controller.js";
const router = Router();

router.get("/", index);
router.post("/create", store);
router.get("/show/:slug", show);
router.put("/update/:slug", update);
router.delete("/delete/:slug", destroy);
router.put("/change-status/:slug", changeStatus);
router.post("/register", register);

export default router;