import { Router } from "express";
import { indexController, storeController, showController, updateController, destroyController, changeStatusController } from "./AmazingSell.Controller.js";
const router = Router();

router.get("/", indexController);
router.post("/create", storeController);
router.get("/show/:id", showController);
router.put("/update/:id", updateController);
router.delete("/delete/:id", destroyController);
router.put("/change-status/:id", changeStatusController);

export default router;