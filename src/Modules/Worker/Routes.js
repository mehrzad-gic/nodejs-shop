import { Router } from "express";
import { register, index, store, show, update, destroy, updateAsAdmin } from "./Worker.Controller.js";
import { upload } from '../../Middlewares/UploadMiddleware.js';
const router = Router();

router.get("/", index);
router.post("/create", upload.fields([{name: "image", maxCount: 1}, {name: "images", maxCount: 4}]), store);
router.get("/show/:slug", show);
router.put("/update/:slug", upload.fields([{name: "image", maxCount: 1}, {name: "images", maxCount: 4}]), update);
router.delete("/delete/:slug", destroy);
router.post("/register", register);
router.put("/update-as-admin/:slug", updateAsAdmin);

export default router;