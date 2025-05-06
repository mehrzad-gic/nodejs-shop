import createHttpError from "http-errors";
import { query } from "../../Configs/PostgresQl.js";
import { brandValidation } from "./validation.js";
import uploadQueue from "../../Queues/UpoladQueue.js";
import { makeSlug } from "../../Helpers/Helper.js";


const indexService = async (req, res, next) => {

    try {

        let { page, limit, status, orderBy, orderType } = req.query;
        const offset = (page - 1) * limit;
        page = parseInt(page);
        limit = parseInt(limit);
        orderBy = orderBy.toLowerCase() || "created_at";
        orderType = orderType.toLowerCase() || "desc";
        status = parseInt(status) || 1;

        const sql = `
            SELECT * FROM brands WHERE status = $1 ORDER BY $2 $3 LIMIT $4 OFFSET $5
        `;

        const result = await query(sql, [status, orderBy, orderType, limit, offset]);

        res.status(200).json({
            data: result.rows,
            pagination: {
                total: result.rows.length,
                page: page,
                limit: limit,
                totalPages: Math.ceil(result.rows.length / limit),
            },
            success: true,
        });

    } catch (error) {
        next(error);
    }

}


const storeService = async (req, res, next) => {

    try {

        const { error } = brandValidation.validate(req.body);
        if (error) next(createHttpError.BadRequest(error.message));

        const { name, translations, description } = req.body;

        const slug = await makeSlug(name);

        const sql = `
            INSERT INTO brands (name, slug, translations, description, status) VALUES ($1, $2, $3, $4, $5)
        `;

        const result = await query(sql, [name, slug, translations, description, 1]);

        if(req.file) {
            await uploadQueue.add("upload", {
                files: req.file?.image,
                table: "brands",
                img_field: "image",
                data: {
                    id: result.rows[0].id,
                    image: req.file.image,
                },
            });
        }

        res.status(201).json({
            data: result.rows[0],
            success: true,
        });

    } catch (error) {
        next(error);
    }

}


const showService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const sql = `
            SELECT * FROM brands WHERE slug = $1
        `;

        const result = await query(sql, [slug]);

        if(!result.rows.length) next(createHttpError.NotFound("Brand not found"));

        res.status(200).json({
            data: result.rows[0],
            success: true,
        });

    } catch (error) {
        next(error);
    }

}


const updateService = async (req, res, next) => {

    try {
 
        const { slug } = req.params;

        const { name, translations, description, status } = req.body;

        const sql = `
            UPDATE brands SET name = $1, slug = $2, translations = $3, description = $4, status = $5 WHERE slug = $6
        `;

        const result = await query(sql, [name, slug, translations, description, status, slug]);

        if(req.file) {
            if(result.rows[0].image) {
                await uploadQueue.add("deleteFile", {
                    file: result.rows[0].image,
                });
            }
            await uploadQueue.add("upload", {
                files: req.file?.image,
                table: "brands",
                img_field: "image",
                data: {
                    id: result.rows[0].id,
                    image: req.file.image,
                },
            });
        }

        res.status(200).json({
            data: result.rows[0],
            success: true,
        });

    } catch (error) {
        next(error);
    }
}


const destroyService = async (req, res, next) => {

    try {
        
        const { slug } = req.params;

        const sql = `
            DELETE FROM brands WHERE slug = $1
        `;

        await query(sql, [slug]);

        if(!result.rowCount) next(createHttpError.NotFound("Brand not found"));

        if(result.rows[0].image) {
            await uploadQueue.add("deleteFile", {
                file: result.rows[0].image,
            });
        }

        res.status(200).json({
            success: true,
            message: "Brand deleted successfully",
        });

    } catch (error) {
        next(error);
    }

}


const changeStatusService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const brand = await query(`SELECT * FROM brands WHERE slug = $1`, [slug]);
        if(!brand.rows.length) next(createHttpError.NotFound("Brand not found"));

        const status = brand.rows[0].status === 1 ? 0 : 1;

        const sql = `
            UPDATE brands SET status = $1 WHERE slug = $2
        `;

        await query(sql, [status, slug]);

        if(!result.rowCount) next(createHttpError.NotFound("Brand not found"));

        res.status(200).json({
            success: true,
            message: "Brand status updated successfully",
        });

    } catch (error) {
        next(error);
    }

}


export { indexService, storeService, showService, updateService, destroyService, changeStatusService };
