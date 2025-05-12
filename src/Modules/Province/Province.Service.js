import createHttpError from "http-errors";
import { query } from "../../Configs/PostgresQl.js";
import { validateProvince } from "./validation.js";
import deleteChildQueue from "../../Queues/DeleteChildQueue.js";


export const indexService = async (req, res, next) => {

    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.trim().toLowerCase() || '';
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const sql = `
            SELECT * FROM provinces WHERE 1=1
            ${search ? `AND name LIKE '%${search}%'` : ''}
            ${status ? `AND status = ${status}` : ''}
            LIMIT $1 OFFSET $2
        `;

        const result = await query(sql, [limit, offset]);

        res.status(200).json({
            data: result.rows,
            pagination: {
                total: result.rowCount,
                page: page,
                limit: limit,
                totalPages: Math.ceil(result.rowCount / limit),
            },
            success: true,
        });


    } catch (error) {
        next(error);
    }

}



export const storeService = async (req, res, next) => {

    try {

        const { error } = validateProvince(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const country = await query("SELECT * FROM countries WHERE id = $1", [req.body.country_id]);
        if (!country.rows[0]) next(createHttpError.NotFound("Country not found"));

        const { name, country_id, status, code, longitude, latitude } = req.body;

        const sql = `
            INSERT INTO provinces (name, country_id, status, code, longitude, latitude, coordinates)
            VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326))
        `;

        const result = await query(sql, [name, country_id, status, code, longitude, latitude, longitude, latitude]);

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Province created successfully",
        });

    } catch (error) {
        next(error);
    }

}



export const showService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const province = await query("SELECT * FROM provinces WHERE id = $1", [id]);
        if (!province.rows[0]) next(createHttpError.NotFound("Province not found"));

        res.status(200).json({
            data: province.rows[0],
            success: true,
        });

    } catch (error) {
        next(error);
    }

}



export const updateService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const province = await query("SELECT * FROM provinces WHERE id = $1", [id]);
        if (!province.rows[0]) next(createHttpError.NotFound("Province not found"));

        const { error } = validateProvince(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const country = await query("SELECT * FROM countries WHERE id = $1", [req.body.country_id]);
        if (!country.rows[0]) next(createHttpError.NotFound("Country not found"));

        const { name, country_id, status, code, longitude, latitude } = req.body;
        
        const sql = `
            UPDATE provinces SET name = $1, country_id = $2, status = $3, code = $4, longitude = $5, latitude = $6, coordinates = ST_SetSRID(ST_MakePoint($7, $8), 4326) WHERE id = $9
        `;

        const result = await query(sql, [name, country_id, status, code, longitude, latitude, longitude, latitude, id]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Province updated successfully",
        });

    } catch (error) {
        next(error);
    }

}



export const destroyService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const province = await query("SELECT * FROM provinces WHERE id = $1", [id]);
        if (!province.rows[0]) next(createHttpError.NotFound("Province not found"));

        const sql = `
            DELETE FROM provinces WHERE id = $1
        `;

        const result = await query(sql, [id]);

        deleteChildQueue.add('deleteChild', { 
            model: "cities",
            field: "province_id",
            value: id,
        });

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Province deleted successfully",
        });

    } catch (error) {
        next(error);
    }

}



export const changeStatusService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const province = await query("SELECT * FROM provinces WHERE id = $1", [id]);
        if (!province.rows[0]) next(createHttpError.NotFound("Province not found"));

        const sql = `
            UPDATE provinces SET status = $1 WHERE id = $2
        `;

        const result = await query(sql, [province.rows[0].status === 1 ? 0 : 1, id]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Province status updated successfully",
        });

    } catch (error) {
        next(error);
    }

}



