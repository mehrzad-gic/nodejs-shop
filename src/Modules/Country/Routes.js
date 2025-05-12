import { Router } from "express";
import { indexService, storeService, showService, updateService, destroyService, changeStatusService } from "./Country.Service";
const router = Router();

router.get("/", indexService);
router.post("/create", storeService);
router.get("/show/:id", showService);
router.put("/update/:id", updateService);
router.delete("/delete/:id", destroyService);
router.put("/change-status/:id", changeStatusService);

export default router;