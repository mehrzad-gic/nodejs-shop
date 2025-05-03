import { postgresQlClient } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { workerValidation, workerUpdateValidation } from "./validation.js";

async function indexService(req, res, next){
 
    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = status.toLowerCase() || "active";
        const offset = (page - 1) * limit;

        const query = "select * from workers WHERE slug like '%$1%' and status = $2 limit $3 offset $4";
        const result = await postgresQlClient.query(query, [search, status, limit, offset]);

        res.status(200).json({
            data: result.rows,
            pagination: {
                total: result.rows.length,
                page: page,
                limit: limit
            },
            success: true,
            message: "Workers fetched successfully"
        })

    } catch (error) {
        next(error)
    }
    
}


async function storeService(req, res, next){
 
    try {

        const { name, username, address, description, national_code, city, body_info } = req.body;

        // validate request body
        const {error} = workerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        // check city exists
        const city_check = await postgresQlClient.query("select * from cities where slug = $1", [city]);
        if(!city_check.rows[0]) next(createHttpError.NotFound("City not found"));

        // check if user exists
        const user = await postgresQlClient.query("select * from users where slug = $1", [username]);
        if(!user.rows[0]) next(createHttpError.NotFound("User not found"));
    
        // check if worker already exists
        const worker = await postgresQlClient.query("select * from workers where user_id = $1", [user.rows[0].id]);
        if(worker.rows[0]) next(createHttpError.BadRequest("Worker already exists"));
        
        // create worker
        const query = "insert into workers (name, user_id, address, description, national_code, city, body_info) values ($1, $2, $3, $4, $5, $6, $7) returning *";
        const result = await postgresQlClient.query(query, [name, user.rows[0].id, address, description, national_code, city, JSON.stringify(body_info)]);

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Worker created successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function showService(req, res, next){

    try {

        const { slug } = req.params;

        const query = "select * from workers where slug = $1";
        const result = await postgresQlClient.query(query, [slug]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Worker fetched successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function updateService(req, res, next){

    try {

        const { slug } = req.params;

        // request body
        const { name, address, description, slug_input } = req.body;  

        // validate request body
        const {error} = workerUpdateValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        const worker = await postgresQlClient.query("select * from workers where slug = $1", [slug]);
        if(!worker.rows[0]) next(createHttpError.NotFound("Worker not found"));
        if(worker.rows[0].status !== "active") next(createHttpError.BadRequest("Worker is not active"));
        if(worker.rows[0].changes >= 1) next(createHttpError.BadRequest("You can only change details once || Contact Admin with ticket for more details"));

        if(slug_input !== slug){
        
            if(worker.rows[0].slug_changes > 1) next(createHttpError.BadRequest("You can only change the slug once"));

            const worker_check = await postgresQlClient.query("select * from workers where slug = $1", [slug_input]);

            if(worker_check.rows[0]) next(createHttpError.BadRequest("Worker slug already exists"));

        }

        const query = "update workers set name = $1, address = $2, description = $3, slug = $4, slug_changes = $5, changes = $6 where slug = $7";
        const result = await postgresQlClient.query(query, [name, address, description, slug_input, slug_input ? worker.rows[0].slug_changes + 1 : worker.rows[0].slug_changes,worker.rows[0].changes + 1, slug]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Worker updated successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function updateAsAdminService(req, res, next){

    try {

        const { slug } = req.params;

        // request body
        const { name, address, description, slug_input, status } = req.body;  

        // validate request body
        const {error} = workerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        const worker = await postgresQlClient.query("select * from workers where slug = $1", [slug]);
        if(!worker.rows[0]) next(createHttpError.NotFound("Worker not found"));

        if(slug_input !== slug){
        
            const worker_check = await postgresQlClient.query("select * from workers where slug = $1", [slug_input]);

            if(worker_check.rows[0]) next(createHttpError.BadRequest("Worker slug already exists"));
        }

        const query = "update workers set name = $1, address = $2, description = $3, slug = $4, status = $6 where slug = $7";

        const result = await postgresQlClient.query(query, [name, address, description, slug_input, status, slug]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Worker updated successfully"
        })

    } catch (error) {
        next(error)
    }

}

async function destroyService(req, res, next){
    try {

        const { slug } = req.params;

        // check if worker exists
        const worker = await postgresQlClient.query("select * from workers where slug = $1", [slug]);
        if(!worker.rows[0]) throw createHttpError.NotFound("Worker not found");

        // delete worker
        const query = "delete from workers where slug = $1";
        const result = await postgresQlClient.query(query, [slug]);
        
        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Worker deleted successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function registerService(req, res, next){

    try {

        const user = req.user;

        // request body
        const { name, address, description, body_info, national_code, city } = req.body;

        // validate request body
        const {error} = workerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        const worker = await postgresQlClient.query("select * from workers where user_id = $1", [user.id]);
        if(worker.rows[0]) next(createHttpError.BadRequest("Worker already exists"));
        
        // create worker
        const query = "insert into workers (name, user_id, address, description, body_info, national_code, city) values ($1, $2, $3, $4, $5, $6, $7) returning *";
        const result = await postgresQlClient.query(query, [name, user.id, address, description, JSON.stringify(body_info), national_code, city]);

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Worker created successfully"
        })
        
    } catch (error) {
        next(error)
    }

}


export { indexService, storeService, showService, updateService, destroyService, registerService, updateAsAdminService };