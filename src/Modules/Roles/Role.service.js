import { postgresQlClient } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { makeSlug } from "../../Helpers/Helper.js";



async function  indexService(req,res,next){

    try {
        
        let { page, limit } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const query = "select * from roles limit $1 offset $2";
        const roles = await postgresQlClient.query(query, [limit, offset]);

        res.status(200).json({
            success: true,
            message: "Roles fetched successfully",
            data: roles.rows,
            total: roles.rows.length,
            page: page,
            limit: limit
        });
        
    } catch (error) {
        next(error);
    }
}


async function storeService(req,res,next){

    try {
        
        const { name, description } = req.body;

        const { error } = roleSchema.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const slug = await makeSlug(name, "roles");
        const query = "insert into roles (name, description, slug) values ($1, $2, $3) returning *";
        const role = await postgresQlClient.query(query, [name, description, slug]);

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: role.rows[0]
        });

    } catch (error) {
        next(error);
    }

}


async function showService(req,res,next){

    try {
        
        const { slug } = req.params;

        const query = "select * from roles where slug = $1";
        const role = await postgresQlClient.query(query, [slug]);

        res.status(200).json({
            success: true,
            message: "Role fetched successfully",
            data: role.rows[0]
        });

    } catch (error) {
        next(error);
    }

}


async function updateService(req,res,next){

    try {
        
        const { slug } = req.params;
        const { name, description, permissions } = req.body;

        const { error } = roleSchema.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const query = "update roles set name = $1, description = $2 where slug = $3 returning *";
        const role = await postgresQlClient.query(query, [name, description, slug]);

        if(permissions && Array.isArray(permissions) && permissions.length > 0){

            // remove all old permissions
            const query = "delete from permission_role where role_id = $1";
            await postgresQlClient.query(query, [role.rows[0].id]);

            // assign new permissions
            permissions.forEach(async (permission) => {
                const query = "insert into permission_role (role_id, permission_id) values ($1, $2)";
                await postgresQlClient.query(query, [role.rows[0].id, permission]);
            });

        }
        
        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: role.rows[0]
        });

    } catch (error) {
        next(error);
    }

}


async function destroyService(req,res,next){
    
    try {
 
        const { slug } = req.params;
        const query = "delete from roles where slug = $1";
        await postgresQlClient.query(query, [slug]);

        res.status(200).json({
            success: true,
            message: "Role deleted successfully"
        });

    } catch (error) {
        next(error);
    }

}

async function changeStatusService(req,res,next){

    try {
        
        const { slug } = req.params;

        const role = await postgresQlClient.query("select * from roles where slug = $1", [slug]);
        if(role.rows.length == 0) next(createHttpError.BadRequest("Role not found"));

        const status = role.rows[0].status == 1 ? 0 : 1;

        const query = "update roles set status = $1 where slug = $2 returning *";
        const updatedRole = await postgresQlClient.query(query, [status, slug]);

        res.status(200).json({
            success: true,
            message: "Role status updated successfully",
            data: updatedRole.rows[0]
        });

    } catch (error) {
        next(error);
    }

}



//! role user
async function assignRoleService(req,res,next){

    try {
        
        const { user_id, roles } = req.body;

        // check if user_id and roles are provided
        if(!user_id || !roles) next(createHttpError.BadRequest("User ID and roles are required"));

        // check if roles is an array
        if(!Array.isArray(roles)) next(createHttpError.BadRequest("Roles must be an array"));

        // check if roles is not empty
        if(roles.length == 0) next(createHttpError.BadRequest("Roles must be an array"));

        // check if user exists
        const user = await postgresQlClient.query("select * from users where id = $1", [user_id]);
        if(user.rows.length == 0) next(createHttpError.BadRequest("User not found"));


        // remove all old roles
        const query = "delete from role_user where user_id = $1";
        await postgresQlClient.query(query, [user_id]);

        // assign new roles
        roles.forEach(async (role) => {
            const query = "insert into user_roles (user_id, role_id) values ($1, $2)";
            await postgresQlClient.query(query, [user_id, role]);
        });

        res.status(200).json({
            success: true,
            message: "Roles assigned successfully",
            data: roles
        });

    } catch (error) {
        next(error);
    }

}


export { indexService, storeService, showService, updateService, destroyService, assignRoleService, changeStatusService };