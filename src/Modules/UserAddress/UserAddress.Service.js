import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { userAddressValidation } from "./validation.js";

async function indexService(req, res, next){
    
    try {

        let { page, limit } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const query = "select * from user_addresses limit $1 offset $2";
        const result = await query(sql, [limit, offset]);

        res.status(200).json({
            data: result.rows,
            pagination: {
                total: result.rows.length,
                page: page,
                limit: limit
            },
            message: "User addresses fetched successfully",
            success: true
        });

    } catch (error) {
        next(error);
    }
}


async function storeService(req, res, next){
 
    try {

        // current user in http-only cookie
        const user = req.user;

        const { address, city_id, floor, street, latitude, longitude, postal_code } = req.body;

        const {error} = userAddressValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        const sql = "insert into user_addresses (user_id, address, city_id, floor, street, coordinates, postal_code) values ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8) returning *";
        const result = await query(sql, [user.id, address, city_id, floor, street, longitude, latitude, postal_code]);
        
        res.status(201).json({
            data: result.rows[0],
            message: "User address created successfully",
            success: true
        });

    } catch (error) {
        next(error);
    }

}


async function updateService(req, res, next){

    try {

        const user = req.user;
        const { id } = req.params;

        // check if user address exists
        const userAddress = await query("select * from user_addresses where id = $1 and user_id = $2", [id, user.id]);
        if (userAddress.rows.length === 0) next(createHttpError.NotFound("User address not found"));
        
        // request body
        const { address, city_id, floor, street, latitude, longitude, postal_code } = req.body;

        // validate request body
        const {error} = userAddressValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        // update user address
        const sql = "update user_addresses set address = $1, city_id = $2, floor = $3, street = $4, coordinates = ST_SetSRID(ST_MakePoint($5, $6), 4326), postal_code = $7 where id = $8 and user_id = $9 returning *";
        const result = await query(sql, [address, city_id, floor, street, latitude, longitude, postal_code, id, user.id]);

        res.status(200).json({
            data: result.rows[0],
            message: "User address updated successfully",
            success: true
        });
        
    } catch (error) {
        next(error);
    }

}


async function destroyService(req, res, next){

    try {

        const user = req.user;
        const { id } = req.params;

        const userAddress = await query("select * from user_addresses where id = $1 and user_id = $2", [id, user.id]);

        if (userAddress.rows.length === 0) throw createHttpError.NotFound("User address not found");

        await query("delete from user_addresses where id = $1 and user_id = $2", [id, user.id]);
        
        res.status(200).json({
            message: "User address deleted successfully",
            success: true
        });
        
    } catch (error) {
        next(error);
    }

}


async function showService(req, res, next){

    try {

        const { id } = req.params;

        const userAddress = await query("select * from user_addresses where id = $1", [id]);

        if (userAddress.rows.length === 0) throw createHttpError.NotFound("User address not found");

        res.status(200).json({
            data: userAddress.rows[0],
            message: "address fetched successfully",
            success: true

        });

    } catch (error) {
        next(error);

    }

}


async function userAddressesService(req, res, next){

    try {

        const user = req.user;

        const sql = "select * from user_addresses where user_id = $1";
        const result = await query(sql, [user.id]);

        res.status(200).json({
            data: result.rows,
            message: "User addresses fetched successfully",
            success: true
        });

    } catch (error) {
        next(error);
    }

}


async function changeStatusService(req, res, next){

    try {

        const { id } = req.params;

        const userAddress = await query("select * from user_addresses where id = $1", [id]);

        if (userAddress.rows.length === 0) throw createHttpError.NotFound("User address not found");

        const status = userAddress.rows[0].status === 1 ? 0 : 1;
        const sql = "update user_addresses set status = $1 where id = $2 returning *";
        const result = await query(sql, [status, id]);

        res.status(200).json({
            data: result.rows[0],
            message: "User address status updated successfully",
            success: true
        });

    } catch (error) {
        next(error);
    }
}


export { indexService, storeService, updateService, destroyService, showService, userAddressesService, changeStatusService };
