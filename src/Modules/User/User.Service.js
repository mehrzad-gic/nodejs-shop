import { postgresQlClient, query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { makeSlug, checkExistByField, makeHashPassword } from "../../Helpers/Helper.js";
import { userSchema } from "./validation.js";
import UploadQueue from "../../Queues/UpoladQueue.js";


//! services ==========================================================================
async function indexService(req, res, next){

    try {

        let { page, limit, email, status } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 30;
        email = email || "";
        status = status || "";
        const offset = (page - 1) * limit;

        const sql = "select * from users where email like '%' || $1 || '%' and status = $2 limit $3 offset $4";
        const users = await query(sql, [email, status, limit, offset]);

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users.rows,
            pagination: {
                page: page,
                limit: limit,
                total: users.rows.length,
                totalPages: Math.ceil(users.rows.length / limit)
            }
        });
        
    } catch (error) {
        next(error);
    }

}


async function storeService(req, res, next){

    try {

        const { error } = userSchema.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const { email, password, name, phone } = req.body;

        const existUser = await checkExistByField("email", email, "users");
        if(existUser) next(createHttpError.BadRequest("User already exists"));

        const slug = makeSlug(name);
        const hashedPassword = await makeHashPassword(password);

        const sql = "insert into users (email, password, name, phone, slug) values ($1, $2, $3, $4, $5) returning *";
        const user = await query(sql, [email, hashedPassword, name, phone, slug]);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user.rows[0]
        });

    } catch (error) {
        next(error);
    }
}


async function showService(req, res, next){

    try {

        const {slug} = req.params;

        const existUser = await checkExistByField("slug", slug, "users");
        if(!existUser) next(createHttpError.NotFound("User not found"));

        // user with roles
        const sql = "select u.*, r.name as role_name from users u left join roles r on u.role_id = r.id where u.slug = $1";
        const user = await query(sql, [slug]);

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user.rows[0]
        });

    } catch (error) {
        next(error);
    }
}


async function updateService(req, res, next){

    try {
        
        const {slug} = req.params;

        const existUser = await checkExistByField("slug", slug, "users");
        if(!existUser) next(createHttpError.NotFound("User not found"));

        const { error } = userSchema.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const { email, image, name, phone } = req.body;

        if(image){

            if(existUser.image){
                await UploadQueue.add('deleteFile', {
                    file: existUser.image
                });
            }

            await UploadQueue.add('uploadFile', {
                files: image,
                table: 'users',
                img_field: 'image',
                data: {
                    id: existUser.id
                }
            });

        }

        const sql = "update users set email = $1, name = $2, phone = $3 where slug = $4 returning *";  
        const user = await query(sql, [email, name, phone, slug]);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user.rows[0]
        });

    } catch (error) {
        next(error);
    }
}


async function destroyService(req, res, next){

    try {
        
        const {slug} = req.params;

        const existUser = await checkExistByField("slug", slug, "users");
        if(!existUser) next(createHttpError.NotFound("User not found"));

        const sql = "delete from users where slug = $1";
        await query(sql, [slug]);

        if(existUser.image){
            await UploadQueue.add('deleteFile', {
                file: existUser.image
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        next(error);
    }
}


async function changeStatusService(req, res, next){

    try {
    
        const {slug} = req.params;

        const existUser = await checkExistByField("slug", slug, "users");
        if(!existUser) next(createHttpError.NotFound("User not found"));

        const status = existUser.status === 1 ? 0 : 1;

        const sql = "update users set status = $1 where slug = $2";
        await query(sql, [status, slug]);

        res.status(200).json({
            success: true,
            message: "User status updated successfully"
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
    changeStatusService
}