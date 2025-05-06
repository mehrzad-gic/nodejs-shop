import { Router } from "express";
import {
    index,
    store,
    show,
    update,
    destroy,
    changeStatus,
    assignPermission
} from "./Permission.Controller.js";
const permissionRoutes = Router();

permissionRoutes.get("/", index);
permissionRoutes.post("/create", store);
permissionRoutes.get("/show/:slug", show);
permissionRoutes.put("/update/:slug", update);
permissionRoutes.delete("/delete/:slug", destroy);
permissionRoutes.patch("/change-status/:slug", changeStatus);
permissionRoutes.post("/assign", assignPermission);

export default permissionRoutes; 