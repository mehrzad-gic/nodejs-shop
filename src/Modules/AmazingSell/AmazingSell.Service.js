import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { makeSlug } from "../../Helpers/Helper.js";
import uploadQueue from "../../Queues/UpoladQueue.js";
import { amazingSellValidation } from "./validation.js";


export const indexService = async (req, res, next) => {

    try {
     
        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const sql = "select * from amazing_sells where slug like '%$1%' and status = $2 limit $3 offset $4";
        const result = await query(sql, [search, status, limit, offset]);

        res.status(200).json({
            data: result.rows,
            message: "Amazing sells fetched successfully",
            success: true,
            pagination: {
                page: page,
                limit: limit,
                total: result.rows.length,
                totalPages: Math.ceil(result.rows.length / limit)
            }
        })
        
    } catch (error) {
        next(error)
    }

}


export const storeService = async (req, res, next) => {

    try {
    
        const { error } = amazingSellValidation.validate(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const { name, product_id, maximum, type, value, start_date, end_date, status } = req.body;
        
        const product = await query("select * from products where id = $1", [product_id]);
        if (!product.rows[0]) next(createHttpError.NotFound("Product not found"));

        const sql = "insert into amazing_sells (name, product_id, maximum, type, value, start_date, end_date, status) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *";
        const result = await query(sql, [name, product_id, maximum, type, value, start_date, end_date, status]);

        res.status(201).json({
            data: result.rows[0],
            message: "Amazing sell created successfully",
            success: true,
        })
        
    } catch (error) {
        next(error)
    }
    
}


export const showService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const amazingSell = await query("select am.*, p.name as product_name , p.image as product_image , p.slug as product_slug from amazing_sells am left join products p on p.id = am.product_id where am.id = $1", [id]);
        if (!amazingSell.rows[0]) next(createHttpError.NotFound("Amazing sell not found"));

        res.status(200).json({
            data: amazingSell.rows[0],
            message: "Amazing sell fetched successfully",
            success: true,
        })

    } catch (error) {
        next(error)
    }

}


export const updateService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const { error } = amazingSellValidation.validate(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const { name, product_id, maximum, type, value, start_date, end_date, status } = req.body;

        const product = await query("select * from products where id = $1", [product_id]);
        if (!product.rows[0]) next(createHttpError.NotFound("Product not found"));

        const sql = "update amazing_sells set name = $1, product_id = $2, maximum = $3, type = $4, value = $5, start_date = $6, end_date = $7, status = $8 where id = $9 returning *";
        const result = await query(sql, [name, product_id, maximum, type, value, start_date, end_date, status, id]);

        res.status(200).json({
            data: result.rows[0],
            message: "Amazing sell updated successfully",
            success: true,
        })

    } catch (error) {
        next(error)
    }
        
}


export const destroyService = async (req, res, next) => {

    try {
        
        const { id } = req.params;

        const amazingSell = await query("select * from amazing_sells where id = $1", [id]);
        if (!amazingSell.rows[0]) next(createHttpError.NotFound("Amazing sell not found"));

        const sql = "delete from amazing_sells where id = $1";
        await query(sql, [id]);

        res.status(200).json({
            message: "Amazing sell deleted successfully",
            success: true,
        })
        
    } catch (error) {
        next(error)
    }

}


export const changeStatusService = async (req, res, next) => {

    try {
 
        const { id } = req.params;

        const amazingSell = await query("select * from amazing_sells where id = $1", [id]);
        if (!amazingSell.rows[0]) next(createHttpError.NotFound("Amazing sell not found"));

        const sql = "update amazing_sells set status = $1 where id = $2";
        await query(sql, [amazingSell.rows[0].status == 1 ? 0 : 1, id]);

        res.status(200).json({
            message: "Amazing sell status changed successfully",
            success: true,
        })
        
    } catch (error) {
        next(error)
    }

}

