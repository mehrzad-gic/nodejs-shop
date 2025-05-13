import { Router } from "express";
import { index, store, show, update, destroy, changeStatus } from "./CategoryOptionValue.Controller.js";
const router = Router();


router.get("/:option_id", index);
router.post("/create/:option_id", store);
router.get("/show/:id", show);
router.put("/update/:id", update);
router.delete("/delete/:id", destroy);
router.put("/change-status/:id", changeStatus);


export default router;
