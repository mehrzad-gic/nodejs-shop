import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";


export const indexService = async (req, res, next) => {

    try {
     
        let { page, limit, search, status } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        search = search || '';
        status = status || '';

        const offset = (page - 1) * limit;

        const sql = `
            SELECT * FROM countries
            WHERE 1=1
            ${search ? `AND name ILIKE '%${search}%'` : ''}
            ${status ? `AND status = '${status}'` : ''}
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
        
        const { error } = validateCountry(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const { name, status, iso_code_alpha2, iso_code_alpha3, capital, currency_code, longitude, latitude, flag } = req.body;

        const sql = `
            INSERT INTO countries (name, status, iso_code_alpha2, iso_code_alpha3, capital, currency_code, longitude, latitude, coordinates, flag)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($9, $10), 4326), $11)
        `;

        const result = await query(sql, [name, status, iso_code_alpha2, iso_code_alpha3, capital, currency_code, longitude, latitude, flag]);

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Country created successfully",
        });

    } catch (error) {
        next(error);
    }

}


export const showService = async (req, res, next) => {

    try {
        
        const { id } = req.params; // id

        const sql = `
            SELECT cu.*, pr.name as province_name, pr.id as province_id, pr.code as province_code, ci.name as city_name, ci.id as city_id, ci.code as city_code 
            FROM countries cu LEFT JOIN provinces pr ON cu.id = pr.country_id 
            LEFT JOIN cities ci ON pr.id = ci.province_id WHERE cu.id = $1
        `;

        const result = await query(sql, [id]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
        });

    } catch (error) {
        next(error);
    }

}


export const updateService = async (req, res, next) => {

    try {

        const { id } = req.params; // id

        const country = await query("SELECT * FROM countries WHERE id = $1", [id]);
        if (!country.rows[0]) next(createHttpError.NotFound("Country not found"));

        const { error } = validateCountry(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const { name, status, iso_code_alpha2, iso_code_alpha3, capital, currency_code, longitude, latitude, flag } = req.body;
        
        const sql = `
            UPDATE countries SET name = $1, status = $2, iso_code_alpha2 = $3, iso_code_alpha3 = $4, capital = $5, currency_code = $6, longitude = $7, latitude = $8, flag = $9, coordinates = ST_SetSRID(ST_MakePoint($10, $11), 4326) WHERE id = $12
        `;

        const result = await query(sql, [name, status, iso_code_alpha2, iso_code_alpha3, capital, currency_code, longitude, latitude, flag, longitude, latitude, id]);
        
        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Country updated successfully",
        });
        
    } catch (error) {
        next(error);
    }

}


export const destroyService = async (req, res, next) => {

    try {
        
        const { id } = req.params; // id

        const country = await query("SELECT * FROM countries WHERE id = $1", [id]);
        if (!country.rows[0]) next(createHttpError.NotFound("Country not found"));

        const sql = `
            DELETE FROM countries WHERE id = $1
        `;

        const result = await query(sql, [id]);
        
        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Country deleted successfully",
        });

    } catch (error) {
        next(error);
    }

}


export const changeStatusService = async (req, res, next) => {

    try {
        
        const { id } = req.params; // id

        const country = await query("SELECT * FROM countries WHERE id = $1", [id]);
        if (!country.rows[0]) next(createHttpError.NotFound("Country not found"));
        
        const sql = `
            UPDATE countries SET status = $1 WHERE iso_code_alpha3 = $2
        `;

        const result = await query(sql, [country.rows[0].status === 1 ? 0 : 1, code]);
        
        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Country status updated successfully",
        });
        
    } catch (error) {
        next(error);
    }

}


