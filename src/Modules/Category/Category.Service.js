import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { makeSlug } from "../../Helpers/Helper.js";
import uploadQueue from "../../Queues/UpoladQueue.js";
import { categoryValidation } from "./validation.js";


export const indexService = async (req, res, next) => {

    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const query = "select * from categories where slug like '%$1%' and status = $2 limit $3 offset $4";
        const result = await postgresQlClient.query(query, [search, status, limit, offset]);
        
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

        const { error } = categoryValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const { name, translations, status, icon = null } = req.body;

        const slug = await makeSlug(name,"categories");

        const sql = "insert into categories (name,slug,description,status,icon) values ($1, $2, $3, $4, $5) returning *";
        const result = await query(sql, [name, slug, translations, status, icon]);

        if(!result.rows[0]) next(createHttpError.BadRequest("Category not created"));

        if(req.file && req.file.image) {
            await uploadQueue.add("upload", {
                files: [req.file?.image],
                table: "categories",
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
            message: "Category created successfully"
        });
    
    } catch (error) {
        next(error);
    }
    
}

export const showService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const sql = "select * from categories where slug = $1";
        const result = await query(sql, [slug]);

        if(!result.rows[0]) next(createHttpError.NotFound("Category not found"));

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Category fetched successfully"
        });

    } catch (error) {
        next(error);
    }

}

export const updateService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const { error } = categoryValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const category = await query("select * from categories where slug = $1", [slug]);
        if(!category.rows[0]) next(createHttpError.NotFound("Category not found"));

        const { name, description } = req.body;

        const sql = "update categories set name = $1, description = $2 where slug = $3 returning *";
        const result = await query(sql, [name, description, slug]);

        if(!result.rows[0]) next(createHttpError.BadRequest("Category not updated"));

        if(req.file && req.file.image) {

            await uploadQueue.add("deleteFile", {
                file: category.rows[0].image,
            });

            await uploadQueue.add("upload", {
                files: [req.file?.image],
                table: "categories",
                img_field: "image",
                data: {
                    id: category.rows[0].id,
                    image: req.file.image,
                },
            });

        }

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Category updated successfully"
        });

    } catch (error) {
        next(error);
    }

}

export const destroyService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const category = await query("select * from categories where slug = $1", [slug]);
        if(!category.rows[0]) next(createHttpError.NotFound("Category not found"));

        const sql = "delete from categories where slug = $1";
        await query(sql, [slug]);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        next(error);
    }

}

export const changeStatusService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const category = await query("select * from categories where slug = $1", [slug]);
        if(!category.rows[0]) next(createHttpError.NotFound("Category not found"));

        const sql = "update categories set status = $1 where slug = $2";
        await query(sql, [category.rows[0].status === 1 ? 0 : 1, slug]);

        res.status(200).json({
            success: true,
            message: "Category status updated successfully"
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