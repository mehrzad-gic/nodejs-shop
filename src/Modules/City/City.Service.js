import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { validateCity } from "./validation.js";


export const indexService = async (req, res, next) => {

    try {
 
        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.trim().toLowerCase() || '';
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const sql = `
            SELECT * FROM cities WHERE status = $1 AND name LIKE '%${search}%' LIMIT $2 OFFSET $3
        `;

        const result = await query(sql, [status, limit, offset]);

        res.status(200).json({
            data: result.rows,
            success: true,
        });
        
    } catch (error) {
        next(error);
    }

}



export const storeService = async (req, res, next) => {

    try {

        const { error } = validateCity(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const { name, province_id, status, is_capital, longitude, latitude } = req.body;

        const province = await query("SELECT * FROM provinces WHERE id = $1", [province_id]);
        if (!province.rows[0]) next(createHttpError.NotFound("Province not found"));

        const sql = `
            INSERT INTO cities (name, province_id, status, is_capital, longitude, latitude, coordinates) VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326)) RETURNING *
        `;

        const result = await query(sql, [name, province_id, status, is_capital, longitude, latitude, longitude, latitude]);

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "City created successfully",
        });

    } catch (error) {
        next(error);
    }

}



export const showService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const city = await query("SELECT * FROM cities WHERE id = $1", [id]);
        if (!city.rows[0]) next(createHttpError.NotFound("City not found"));

        res.status(200).json({
            data: city.rows[0],
            success: true,
            message: "City fetched successfully",
        });

    } catch (error) {
        next(error);
    }

}



export const updateService = async (req, res, next) => {

    try {
 
        const { id } = req.params;

        const city = await query("SELECT * FROM cities WHERE id = $1", [id]);
        if (!city.rows[0]) next(createHttpError.NotFound("City not found"));

        const { error } = validateCity(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const { name, province_id, status, is_capital, longitude, latitude } = req.body;

        const province = await query("SELECT * FROM provinces WHERE id = $1", [province_id]);
        if (!province.rows[0]) next(createHttpError.NotFound("Province not found"));
        
        const sql = `
            UPDATE cities SET name = $1, province_id = $2, status = $3, is_capital = $4, longitude = $5, latitude = $6, coordinates = ST_SetSRID(ST_MakePoint($7, $8), 4326) WHERE id = $9 RETURNING *
        `;

        const result = await query(sql, [name, province_id, status, is_capital, longitude, latitude, longitude, latitude, id]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "City updated successfully",
        });

    } catch (error) {
        next(error);
    }

}



export const destroyService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const city = await query("SELECT * FROM cities WHERE id = $1", [id]);
        if (!city.rows[0]) next(createHttpError.NotFound("City not found"));

        const sql = `
            DELETE FROM cities WHERE id = $1
        `;

        const result = await query(sql, [id]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "City deleted successfully",
        });

    } catch (error) {
        next(error);
    }

}



export const changeStatusService = async (req, res, next) => {

    try {
 
        const { id } = req.params;

        const city = await query("SELECT * FROM cities WHERE id = $1", [id]);
        if (!city.rows[0]) next(createHttpError.NotFound("City not found"));

        const sql = `
            UPDATE cities SET status = $1 WHERE id = $2
        `;

        const result = await query(sql, [city.rows[0].status === 1 ? 0 : 1, id]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "City status updated successfully",
        });

    } catch (error) {
        next(error);
    }

}