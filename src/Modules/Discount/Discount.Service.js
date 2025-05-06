import { query } from "../../Configs/PostgresQl.js";
import { makeSlug } from "../../Helpers/Helper.js";
import createHttpError from "http-errors";

export const indexService = async (req, res, next) => {
 
    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const sql = "select * from discounts where slug like '%$1%' and status = $2 limit $3 offset $4";
        const result = await query(sql, [search, status, limit, offset]);
        
        res.status(200).json({
            data: result.rows,
            pagination: {
                page: page,
                limit: limit,
                total: result.rowCount,
                totalPage: Math.ceil(result.rowCount / limit)
            },
            success: true,
            message: "Discounts fetched successfully"
        });
           
    } catch (error) {
        next(createHttpError.InternalServerError(error.message));
    }

}

export const storeService = async (req, res, next) => {

    try {
        
        const { name, description, value, status, start_date, end_date, maximum, type } = req.body;
       
        const slug = await makeSlug(name);

        const sql = "insert into discounts (name, description, value, status, start_date, end_date, maximum, type, slug) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
        const result = await query(sql, [name, description, value, status, start_date, end_date, maximum, type, slug]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Discount created successfully"
        });

    } catch (error) {
        next(createHttpError.InternalServerError(error.message));
    }

}

export const showService = async (req, res, next) => {
 
    try {

        const { id } = req.params;

        const sql = "select * from discounts where id = $1";
        const result = await query(sql, [id]);
        
        if (result.rows.length === 0) return next(createHttpError.NotFound("Discount not found"));

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Discount fetched successfully"
        });

    } catch (error) {
        next(createHttpError.InternalServerError(error.message));
    }

}


export const updateService = async (req, res, next) => {

    try {

        const { id } = req.params;
        const { name, description, value, status, start_date, end_date, maximum, type } = req.body;

        const sql = "update discounts set name = $1, description = $2, value = $3, status = $4, start_date = $5, end_date = $6, maximum = $7, type = $8 where id = $9";
        const result = await query(sql, [name, description, value, status, start_date, end_date, maximum, type, id]);

        if (result.rowCount === 0) return next(createHttpError.NotFound("Discount not found"));

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Discount updated successfully"
        });
        
    } catch (error) {
        next(createHttpError.InternalServerError(error.message));
    }

}


export const destroyService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const sql = "delete from discounts where id = $1";
        const result = await query(sql, [id]);

        if (result.rowCount === 0) return next(createHttpError.NotFound("Discount not found"));

        res.status(200).json({
            success: true,
            message: "Discount deleted successfully"
        });
        
    } catch (error) {
        next(createHttpError.InternalServerError(error.message));
    }

}


export const changeStatusService = async (req, res, next) => {

    try {
 
        const { id } = req.params;
        
        const discount = await query("select status from discounts where id = $1", [id]);

        if (discount.rows.length === 0) return next(createHttpError.NotFound("Discount not found"));

        const status = discount.rows[0].status === 1 ? 0 : 1;

        const sql = "update discounts set status = $1 where id = $2";
        const result = await query(sql, [status, id]);

        res.status(200).json({
            success: true,
            message: "Discount status updated successfully"
        });

    } catch (error) {
        next(createHttpError.InternalServerError(error.message));
    }

}

export { indexService, storeService, showService, updateService, destroyService, changeStatusService };