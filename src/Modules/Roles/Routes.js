import { Router } from "express";
import { index, store, show, update, destroy, assignRole, changeStatus } from "./Role.Controller.js";
const router = Router();

router.get("/", index);
router.post("/create", store);
router.get("/show/:slug", show);
router.put("/update/:slug", update);
router.delete("/delete/:slug", destroy);
router.post("/assign-role", assignRole);
router.put("/change-status/:slug", changeStatus);

export default router;