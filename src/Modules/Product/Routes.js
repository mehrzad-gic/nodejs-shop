import { Router } from "express";
import { indexService, storeService, showService, updateService, destroyService, changeStatusService } from "./Product.Service.js";
const router = Router();


router.get("/", indexService);
router.post("/create", storeService);
router.get("/show/:slug", showService);
router.put("/update/:slug", updateService);
router.delete("/delete/:slug", destroyService);
router.put("/change-status/:slug", changeStatusService);

export default router;