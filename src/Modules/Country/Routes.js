import { Router } from "express";
import { index, store, show, update, destroy, changeStatus } from "./Country.Controller.js";
const router = Router();

router.get("/", index);
router.post("/create", store);
router.get("/show/:id", show);
router.put("/update/:id", update);
router.delete("/delete/:id", destroy);
router.put("/change-status/:id", changeStatus);

export default router;