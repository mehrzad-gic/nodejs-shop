import { postgresQlClient, query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { sellerValidation, registerValidation } from "./validation.js";
import { makeSlug } from "../../Helpers/Helper.js";
import uploadQueue from "../../Queues/UpoladQueue.js";
import { status as statusType } from "./validation.js";

async function indexService(req, res, next){
 
    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = status.toLowerCase() || "active";
        const offset = (page - 1) * limit;

        const sql = "select * from sellers WHERE slug like '%$1%' and status = $2 limit $3 offset $4";
        const result = await query(sql, [search, status, limit, offset]);

        res.status(200).json({
            data: result.rows,
            pagination: {
                total: result.rows.length,
                page: page,
                limit: limit
            },
            success: true,
            message: "Seller fetched successfully"
        })

    } catch (error) {
        next(error)
    }
    
}


async function storeService(req, res, next){
    
    try {

        const { name, username, description } = req.body;

        // validate request body
        const {error} = sellerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        // check if user exists
        const user = await query("select * from users where slug = $1", [username]);
        if(!user.rows[0]) next(createHttpError.NotFound("User not found"));
    
        // check if seller already exists
        const seller = await query("select * from sellers where user_id = $1", [user.rows[0].id]);
        if(seller.rows[0]) next(createHttpError.BadRequest("Seller already exists"));
        
        const slug = await makeSlug(name, "sellers");

        // create seller
        const sql = "insert into sellers (name, user_id, description, slug, status) values ($1, $2, $3, $4, $5) returning *";
        const result = await query(sql, [name, user.rows[0].id, description, slug, statusType.PENDING]);

        if(!result.rows[0]) next(createHttpError.BadRequest("Seller not created"));

        if(req.files && req.files.length > 0 && req.files.image){
            await uploadQueue.add("uploadFile", {
                files: req.files.image,
                table: "sellers",
                img_field: "image",
                data: {
                    id: result.rows[0].id,
                    slug: result.rows[0].slug
                }
            });
        }

        if(req.files && req.files.length > 0 && req.files.images){
            await uploadQueue.add("uploadFile", {
                files: req.files.images,
                table: "sellers",
                img_field: "images",
                data: {
                    id: result.rows[0].id,
                    slug: result.rows[0].slug
                }
            });
        }

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Seller created successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function showService(req, res, next){

    try {

        const { slug } = req.params;

        const sql = "select * from sellers where slug = $1";
        const result = await query(sql, [slug]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Seller fetched successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function updateService(req, res, next){

    try {

        const { slug } = req.params;

        const seller = await query("select * from sellers where slug = $1", [slug]);
        if(!seller.rows[0]) next(createHttpError.NotFound("Seller not found"));
        if(seller.rows[0].status !== "active") next(createHttpError.BadRequest("Seller is not active"));
        if(seller.rows[0].changes >= 1) next(createHttpError.BadRequest("You can only change details once || Contact Admin with ticket for more details"));

        // request body
        const { name, latitude,longitude, address, description, slug_input } = req.body;  

        // validate request body
        const {error} = sellerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        if(slug_input !== slug){
        
            const seller_check = await query("select * from sellers where slug = $1", [slug_input]);

            if(seller_check.rows[0]) next(createHttpError.BadRequest("Seller slug already exists"));
        
            if(seller.rows[0].slug_changes > 1) next(createHttpError.BadRequest("You can only change the slug once"));

        }

        const sql = "update sellers set name = $1, coordinates = ST_SetSRID(ST_MakePoint($2, $3), 4326), address = $4, description = $5, slug = $6, slug_changes = $7, changes = $8 where slug = $9";
        const result = await query(sql, [name, longitude, latitude, address, description, slug_input, slug_input ? seller.rows[0].slug_changes + 1 : seller.rows[0].slug_changes,seller.rows[0].changes + 1, slug]);

        if(!result.rows[0]) next(createHttpError.BadRequest("Seller not updated"));

        if(req.files && req.files.length > 0){

            if(req.files.image){
                if(seller.rows[0].image){
                    await uploadQueue.add("deleteFile", {
                        file: seller.rows[0].image,
                    });
                }
                await uploadQueue.add("uploadFile", {
                    files: req.files.image,
                    table: "sellers",
                    img_field: "image",
                    data: {
                        id: result.rows[0].id,
                        slug: result.rows[0].slug
                    }
                });
            }

            if(req.files.images){

                if(seller.rows[0].images){
                    await uploadQueue.add("deleteFile", {
                        files : seller.rows[0].images,
                    });
                }

                await uploadQueue.add("uploadFile", {
                    files: req.files.images,
                    table: "sellers",
                    img_field: "images",
                    data: {
                        id: result.rows[0].id,
                        slug: result.rows[0].slug
                    }
                });
            }
        }

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Seller updated successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function updateAsAdminService(req, res, next){

    try {

        const { slug } = req.params;

        const seller = await query("select * from sellers where slug = $1", [slug]);
        if(!seller.rows[0]) next(createHttpError.NotFound("Seller not found"));

        const { name, latitude, longitude, address, description, slug_input, status } = req.body;  

        // validate request body
        const {error} = sellerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        if(slug_input !== slug){
        
            const seller_check = await query("select * from sellers where slug = $1", [slug_input]);

            if(seller_check.rows[0]) next(createHttpError.BadRequest("Seller slug already exists"));
        
            if(seller.rows[0].slug_changes > 1) next(createHttpError.BadRequest("You can only change the slug once"));

        }

        const sql = "update sellers set name = $1, coordinates = ST_SetSRID(ST_MakePoint($2, $3), 4326), address = $4, description = $5, slug = $6, slug_changes = $7, status = $8 where slug = $9";

        const result = await query(sql, [name, longitude, latitude, address, description, slug_input, slug_input ? seller.rows[0].slug_changes + 1 : seller.rows[0].slug_changes, status, slug]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Seller updated successfully"
        })

    } catch (error) {
        next(error)
    }

}

async function destroyService(req, res, next){
    
    try {

        const { slug } = req.params;

        // check if seller exists
        const seller = await query("select * from sellers where slug = $1", [slug]);
        if(!seller.rows[0]) throw createHttpError.NotFound("Seller not found");

        // delete seller
        const sql = "delete from sellers where slug = $1";
        const result = await query(sql, [slug]);
        
        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Seller deleted successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function registerService(req, res, next){

    try {

        const user = req.user;

        // request body
        const { name, description } = req.body;

        // validate request body
        const {error} = registerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        const seller = await query("select * from sellers where user_id = $1", [user.id]);
        if(seller.rows[0]) next(createHttpError.BadRequest("Seller already exists"));

        const slug = await makeSlug(name, "sellers");

        // create seller
        const sql = "insert into sellers (name, user_id, description, slug, status) values ($1, $2, $3, $4, $5) returning *";
        const result = await query(sql, [name, user.id, description, slug, statusType.PENDING]);

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Seller created successfully"
        })
        
    } catch (error) {
        next(error)
    }

}


export { indexService, storeService, showService, updateService, destroyService, registerService, updateAsAdminService };