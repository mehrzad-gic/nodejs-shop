import { postgresQlClient } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { sellerValidation } from "./validation.js";

async function indexService(req, res, next){
 
    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const query = "select * from sellers WHERE slug like '%$1%' and status = $2 limit $3 offset $4";
        const result = await postgresQlClient.query(query, [search, status, limit, offset]);

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

        const { name, username, latitude, longitude, address, image, images, description } = req.body;

        // check if user exists
        const user = await postgresQlClient.query("select * from users where slug = $1", [username]);
        if(!user.rows[0]) next(createHttpError.NotFound("User not found"));
    
        // check if seller already exists
        const seller = await postgresQlClient.query("select * from sellers where user_id = $1", [user.rows[0].id]);
        if(seller.rows[0]) next(createHttpError.BadRequest("Seller already exists"));
        
        // create seller
        const query = "insert into sellers (name, user_id, coordinates, address, description) values ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6) returning *";
        const result = await postgresQlClient.query(query, [name, user.rows[0].id, longitude, latitude, address, description]);

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

        const query = "select * from sellers where slug = $1";
        const result = await postgresQlClient.query(query, [slug]);

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

        const seller = await postgresQlClient.query("select * from sellers where slug = $1", [slug]);
        if(!seller.rows[0]) next(createHttpError.NotFound("Seller not found"));

        const { name, latitude, longitude, address, description, slug_input } = req.body;  

        if(slug_input !== slug){
        
            const seller_check = await postgresQlClient.query("select * from sellers where slug = $1", [slug_input]);

            if(seller_check.rows[0]) next(createHttpError.BadRequest("Seller slug already exists"));
        
            if(seller.rows[0].slug_changes > 1) next(createHttpError.BadRequest("You can only change the slug once"));

        }

        const query = "update sellers set name = $1, coordinates = ST_SetSRID(ST_MakePoint($2, $3), 4326), address = $4, description = $5, slug = $6, slug_changes = $7 where slug = $8";
        const result = await postgresQlClient.query(query, [name, longitude, latitude, address, description, slug_input, seller.rows[0].slug_changes + 1, slug]);

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
        const seller = await postgresQlClient.query("select * from sellers where slug = $1", [slug]);
        if(!seller.rows[0]) throw createHttpError.NotFound("Seller not found");

        // delete seller
        const query = "delete from sellers where slug = $1";
        const result = await postgresQlClient.query(query, [slug]);
        
        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Seller deleted successfully"
        })

    } catch (error) {
        next(error)
    }

}



async function changeStatusService(req, res, next){

    try {

        const { slug } = req.params;

        const seller = await postgresQlClient.query("select * from sellers where slug = $1", [slug]);
        if(!seller.rows[0]) throw createHttpError.NotFound("Seller not found");

        const status = seller.rows[0].status === 1 ? 0 : 1;
        const query = "update sellers set status = $1 where slug = $2";
        const result = await postgresQlClient.query(query, [status, slug]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Seller status updated successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function registerService(req, res, next){

    try {

        const user = req.user;

        // request body
        const { name, latitude, longitude, address, description } = req.body;

        // validate request body
        const {error} = sellerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        const seller = await postgresQlClient.query("select * from sellers where user_id = $1", [user.id]);
        if(seller.rows[0]) next(createHttpError.BadRequest("Seller already exists"));
        
        // create seller
        const query = "insert into sellers (name, user_id, coordinates, address, description) values ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6) returning *";
        const result = await postgresQlClient.query(query, [name, user.id, longitude, latitude, address, description]);

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Seller created successfully"
        })
        
    } catch (error) {
        next(error)
    }

}


export { indexService, storeService, showService, updateService, destroyService, changeStatusService };