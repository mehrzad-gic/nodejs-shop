import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { categoryOptionValidation } from "./validation.js";


async function indexService(req, res, next){
 
    try {
     
        const { slug } = req.params;

        // check if category exists
        const category_check = await query("select * from categories where slug = $1", [slug]);
        if(!category_check.rows[0]) next(createHttpError.NotFound("Category not found"));
        
        // get category options
        const category_options_check = await query("select * from category_options where category_id = $1", [category_check.rows[0].id]);

        res.status(200).json({
            data: category_options_check.rows,
            success: true,
            message: "Category options fetched successfully"
        })
        
    } catch (error) {
        next(error);
    }
    
}


async function storeService(req, res, next){

    try {
    
        const { slug } = req.params;
        const { key, value, status } = req.body;

        // check if category exists
        const category_check = await query("select * from categories where slug = $1", [slug]);
        if(!category_check.rows[0]) next(createHttpError.NotFound("Category not found"));
        
        // validate request body
        const { error } = categoryOptionValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        // create category option
        const category_option = await query("insert into category_options (key, value, status, category_id) values ($1, $2, $3, $4) returning *", [key, value, status, category_check.rows[0].id]);

        res.status(201).json({
            data: category_option.rows[0],
            success: true,
            message: "Category option created successfully"
        })
        
        
    } catch (error) {
        next(error);
    }

}


async function showService(req, res, next){

    try {
 
        const { id } = req.params;

        // check if category option exists
        const category_option_check = await query("select * from category_options where id = $1", [id]);
        if(!category_option_check.rows[0]) next(createHttpError.NotFound("Category option not found"));
        
        res.status(200).json({
            data: category_option_check.rows[0],
            success: true,
            message: "Category option fetched successfully"
        })
        
    } catch (error) {
        next(error);
    }

}


async function updateService(req, res, next){

    try {

        const { id } = req.params;

        // check if category option exists
        const category_option_check = await query("select * from category_options where id = $1", [id]);
        if(!category_option_check.rows[0]) next(createHttpError.NotFound("Category option not found"));
        
        // validate request body
        const { error } = categoryOptionValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        // update category option
        const category_option = await query("update category_options set status = $1, key = $2, value = $3 where id = $4 returning *", [req.body.status, req.body.key, req.body.value, id]);
        
        res.status(200).json({
            data: category_option.rows[0],
            success: true,
            message: "Category option updated successfully"
        })

    } catch (error) {
        next(error);
    }

}


async function destroyService(req, res, next){

    try {
 
        const { id } = req.params;

        // check if category option exists
        const category_option_check = await query("select * from category_options where id = $1", [id]);
        if(!category_option_check.rows[0]) next(createHttpError.NotFound("Category option not found"));
        
        // delete category option
        await query("delete from category_options where id = $1", [id]);

        res.status(200).json({
            success: true,
            message: "Category option deleted successfully"
        })

    } catch (error) {
        next(error);
    }

}


async function changeStatusService(req, res, next){

    try {

        const { id } = req.params;

        // check if category option exists
        const category_option_check = await query("select * from category_options where id = $1", [id]);
        if(!category_option_check.rows[0]) next(createHttpError.NotFound("Category option not found"));
        
        // update category option status
        const category_option = await query("update category_options set status = $1 where id = $2 returning *", [category_option_check.rows[0].status === 1 ? 0 : 1, id]);

        res.status(200).json({
            data: category_option.rows[0],
            success: true,
            message: "Category option status updated successfully"
        })
        
        
    } catch (error) {
        next(error);
    }

}


export { indexService, storeService, showService, updateService, destroyService, changeStatusService };
