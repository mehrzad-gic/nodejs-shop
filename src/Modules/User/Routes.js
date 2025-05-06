import { Router } from "express";
import { index, store, show, update, destroy, changeStatus } from "./User.Controller.js";
import { upload } from '../../Middlewares/UploadMiddleware.js';
const router = Router();

router.get("/", index);
router.post("/create", store);
router.get("/show/:slug", show);
router.put("/update/:slug", upload.single("image"), update);
router.delete("/delete/:slug", destroy);
router.put("/change-status/:slug", changeStatus);

export default router;