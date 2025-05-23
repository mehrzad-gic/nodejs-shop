import { query } from "../../Configs/PostgresQl.js";
import { tagValidation } from "./validation.js";
import createHttpError from "http-errors";
import { makeSlug } from "../../Helpers/Helper.js";

export const indexService = async (req, res, next) => {

    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const sql = "select * from tags where slug like '%$1%' and status = $2 limit $3 offset $4";
        const result = await query(sql, [search, status, limit, offset]);
        
        res.status(200).json({
            data: result.rows,
            pagination: {
                total: result.rows.length,
                page: page,
                limit: limit
            },
            success: true,
        });

    } catch (error) {
        next(error);
    }

}

export const storeService = async (req, res, next) => {

    try {

        const { error } = tagValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const { name,translations, description } = req.body;

        const slug = await makeSlug(name,"tags");

        const sql = "insert into tags (name,slug,description,translations) values ($1, $2, $3, $4) returning *";
        const result = await query(sql, [name, slug, description,translations]);

        if(!result.rows[0]) next(createHttpError.BadRequest("Tag not created"));

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Tag created successfully"
        });
    
    } catch (error) {
        next(error);
    }
    
}

export const showService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const sql = "select * from tags where slug = $1";
        const result = await query(sql, [slug]);

        if(!result.rows[0]) next(createHttpError.NotFound("Tag not found"));

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Tag fetched successfully"
        });

    } catch (error) {
        next(error);
    }

}

export const updateService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const { error } = tagValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const tag = await query("select * from tags where slug = $1", [slug]);
        if(!tag.rows[0]) next(createHttpError.NotFound("Tag not found"));

        const { name, translations, description } = req.body;

        const sql = "update tags set name = $1, description = $2, translations = $3 where slug = $4 returning *";
        const result = await query(sql, [name, description, translations, slug]);

        if(!result.rows[0]) next(createHttpError.BadRequest("Tag not updated"));

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Tag updated successfully"
        });

    } catch (error) {
        next(error);
    }

}

export const destroyService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const tag = await query("select * from tags where slug = $1", [slug]);
        if(!tag.rows[0]) next(createHttpError.NotFound("Tag not found"));

        const sql = "delete from tags where slug = $1";
        await query(sql, [slug]);

        res.status(200).json({
            success: true,
            message: "Tag deleted successfully"
        });

    } catch (error) {
        next(error);
    }

}

export const changeStatusService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const tag = await query("select * from tags where slug = $1", [slug]);
        if(!tag.rows[0]) next(createHttpError.NotFound("Tag not found"));

        const sql = "update tags set status = $1 where slug = $2";
        await query(sql, [tag.rows[0].status === 1 ? 0 : 1, slug]);

        res.status(200).json({
            success: true,
            message: "Tag status updated successfully"
        });

    } catch (error) {
        next(error);
    }

}

export {
    indexService,
    storeService,
    showService,
    updateService,
    destroyService,
    changeStatusService
}