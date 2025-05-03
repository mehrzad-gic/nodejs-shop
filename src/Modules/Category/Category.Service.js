import { postgresQlClient } from "../../config/postgres.js";
import { categoryValidation } from "./validation.js";
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

        const { name, description } = req.body;

        const slug = await makeSlug(name,"categories");

        const query = "insert into categories (name,slug,description) values ($1, $2, $3) returning *";
        const result = await postgresQlClient.query(query, [name, slug, description]);

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

        const query = "select * from categories where slug = $1";
        const result = await postgresQlClient.query(query, [slug]);

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

        const category = await postgresQlClient.query("select * from categories where slug = $1", [slug]);
        if(!category.rows[0]) next(createHttpError.NotFound("Category not found"));

        const { name, description } = req.body;

        const query = "update categories set name = $1, description = $2 where slug = $3 returning *";
        const result = await postgresQlClient.query(query, [name, description, slug]);

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

        const category = await postgresQlClient.query("select * from categories where slug = $1", [slug]);
        if(!category.rows[0]) next(createHttpError.NotFound("Category not found"));

        const query = "delete from categories where slug = $1";
        await postgresQlClient.query(query, [slug]);

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

        const category = await postgresQlClient.query("select * from categories where slug = $1", [slug]);
        if(!category.rows[0]) next(createHttpError.NotFound("Category not found"));

        const query = "update categories set status = $1 where slug = $2";
        await postgresQlClient.query(query, [category.rows[0].status === 1 ? 0 : 1, slug]);

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