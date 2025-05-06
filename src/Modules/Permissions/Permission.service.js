import { postgresQlClient, query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { makeSlug } from "../../Helpers/Helper.js";
import { permissionSchema } from "./validation.js";


async function indexService(req, res, next) {

    try {
    
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const sql = "SELECT * FROM permissions LIMIT $1 OFFSET $2";
        const permissions = await query(sql, [limit, offset]);

        res.status(200).json({
            success: true,
            message: "Permissions fetched successfully",
            data: permissions.rows,
            total: permissions.rows.length,
            page: page,
            limit: limit
        });

    } catch (error) {
        next(error);
    }
}


async function storeService(req, res, next) {

    try {

        const { name, description } = req.body;

        const { error } = permissionSchema.validate(req.body);

        if (error) return next(createHttpError.BadRequest(error.message));

        const slug = await makeSlug(name, "permissions");
        const sql = "INSERT INTO permissions (name, description, slug) VALUES ($1, $2, $3) RETURNING *";
        const permission = await query(sql, [name, description, slug]);

        res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: permission.rows[0]
        });

    } catch (error) {
        next(error);
    }

}


async function showService(req, res, next) {

    try {

        const { slug } = req.params;
        const sql = "SELECT * FROM permissions WHERE slug = $1";
        const permission = await query(sql, [slug]);

        if (permission.rows.length === 0) {
            return next(createHttpError.NotFound("Permission not found"));
        }

        res.status(200).json({
            success: true,
            message: "Permission fetched successfully",
            data: permission.rows[0]
        });
    } catch (error) {
        next(error);
    }

}


async function updateService(req, res, next) {

    try {

        const { slug } = req.params;
        const { name, description } = req.body;

        const { error } = permissionSchema.validate(req.body);
        if (error) return next(createHttpError.BadRequest(error.message));

        const sql = "UPDATE permissions SET name = $1, description = $2 WHERE slug = $3 RETURNING *";
        const permission = await query(sql, [name, description, slug]);

        if (permission.rows.length === 0) {
            return next(createHttpError.NotFound("Permission not found"));
        }

        res.status(200).json({
            success: true,
            message: "Permission updated successfully",
            data: permission.rows[0]
        });

    } catch (error) {
        next(error);
    }

}


async function destroyService(req, res, next) {

    try {

        const { slug } = req.params;
        const sql = "DELETE FROM permissions WHERE slug = $1";
        const result = await query(sql, [slug]);

        if (result.rowCount === 0) {
            return next(createHttpError.NotFound("Permission not found"));
        }

        res.status(200).json({
            success: true,
            message: "Permission deleted successfully"
        });

    } catch (error) {
        next(error);
    }

}


async function changeStatusService(req, res, next) {

    try {

        const { slug } = req.params;
        const permission = await query("SELECT * FROM permissions WHERE slug = $1", [slug]);

        if (permission.rows.length === 0) {
            return next(createHttpError.NotFound("Permission not found"));
        }

        const status = permission.rows[0].status === 1 ? 0 : 1;
        const query = "UPDATE permissions SET status = $1 WHERE slug = $2 RETURNING *";
        const updatedPermission = await postgresQlClient.query(query, [status, slug]);

        res.status(200).json({
            success: true,
            message: "Permission status updated successfully",
            data: updatedPermission.rows[0]
        });

    } catch (error) {
        next(error);
    }

}


async function assignPermissionService(req, res, next) {

    const client = await postgresQlClient();

    try {

        const { role_id, permissions } = req.body;

        if (!role_id || !permissions) next(createHttpError.BadRequest("Role ID and permissions are required"));
        if (!Array.isArray(permissions)) return next(createHttpError.BadRequest("Permissions must be an array"));
        if (permissions.length === 0) return next(createHttpError.BadRequest("Permissions array cannot be empty"));

        // Check if role exists
        const role = await query("SELECT * FROM roles WHERE id = $1", [role_id]);
        if (role.rows.length === 0) {
            return next(createHttpError.NotFound("Role not found"));
        }

        await client.query('BEGIN');

        // Remove all old permissions
        await client.query("DELETE FROM role_permissions WHERE role_id = $1", [role_id]);

        // Assign new permissions
        for (const permission_id of permissions) {
            await client.query(
                "INSERT INTO role_permission (role_id, permission_id) VALUES ($1, $2)",
                [role_id, permission_id]
            );
        }

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: "Permissions assigned successfully",
            data: permissions
        });

    } catch (error) {
        next(error);
    }

}


export {
    indexService,
    storeService,
    showService,
    updateService,
    destroyService,
    changeStatusService,
    assignPermissionService
}; 