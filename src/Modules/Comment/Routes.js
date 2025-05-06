import { Router } from "express";
import { index, store, show, update, destroy, changeStatus, getCommentByPost } from "./Comment.Controller.js";

const router = Router();

router.get("/", index);
router.post("/create", store);
router.get("/show/:slug", show);
router.put("/update/:slug", update);
router.delete("/delete/:slug", destroy);
router.put("/change-status/:slug", changeStatus);
router.get("/post/:slug", getCommentByPost);

export default router;