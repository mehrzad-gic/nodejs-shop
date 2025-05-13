import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { categoryOptionValueValidation } from "./validation.js";


async function indexService(req, res, next){
 
    try {
     
        const { option_id } = req.params;

        // check if category_option exists
        const category_option_check = await query("select * from category_options where id = $1", [option_id]);
        if(!category_option_check.rows[0]) next(createHttpError.NotFound("Category option not found"));
        
        // get category option values
        const category_option_values_check = await query("select * from category_option_values where category_option_id = $1", [category_option_check.rows[0].id]);

        res.status(200).json({
            data: category_option_values_check.rows,
            success: true,
            message: "Category option values fetched successfully"
        })
        
    } catch (error) {
        next(error);
    }
    
}


async function storeService(req, res, next){

    try {
    
        const { option_id } = req.params;
        const { name, status } = req.body;

        // check if category_option exists
        const category_option_check = await query("select * from category_options where id = $1", [option_id]);
        if(!category_option_check.rows[0]) next(createHttpError.NotFound("Category option not found"));
        
        // validate request body
        const { error } = categoryOptionValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        // create category option
        const category_option = await query("insert into category_option_values (name, status, category_option_id) values ($1, $2, $3) returning *", [name, status, category_option_check.rows[0].id]);

        res.status(201).json({
            data: category_option.rows[0],
            success: true,
            message: "Category option value created successfully"
        })
        
        
    } catch (error) {
        next(error);
    }

}


async function showService(req, res, next){

    try {
 
        const { id } = req.params;

        // check if category option value exists
        const category_option_value_check = await query("select * from category_option_values where id = $1", [id]);
        if(!category_option_value_check.rows[0]) next(createHttpError.NotFound("Category option value not found"));
        
        res.status(200).json({
            data: category_option_value_check.rows[0],
            success: true,
            message: "Category option value fetched successfully"
        })
        
    } catch (error) {
        next(error);
    }

}


async function updateService(req, res, next){

    try {

        const { id } = req.params;

        // check if category option value exists
        const category_option_value_check = await query("select * from category_option_values where id = $1", [id]);
        if(!category_option_value_check.rows[0]) next(createHttpError.NotFound("Category option value not found"));
        
        // validate request body
        const { error } = categoryOptionValueValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        // update category option value
        const category_option_value = await query("update category_option_values set status = $1, name = $2 where id = $3 returning *", [req.body.status, req.body.name, id]);
        
        res.status(200).json({
            data: category_option_value.rows[0],
            success: true,
            message: "Category option value updated successfully"
        })

    } catch (error) {
        next(error);
    }

}


async function destroyService(req, res, next){

    try {
 
        const { id } = req.params;

        // check if category option value exists
        const category_option_value_check = await query("select * from category_option_values where id = $1", [id]);
        if(!category_option_value_check.rows[0]) next(createHttpError.NotFound("Category option value not found"));
        
        // delete category option value
        await query("delete from category_option_values where id = $1", [id]);

        res.status(200).json({
            success: true,
            message: "Category option value deleted successfully"
        })

    } catch (error) {
        next(error);
    }

}


async function changeStatusService(req, res, next){

    try {

        const { id } = req.params;

        // check if category option value exists
        const category_option_value_check = await query("select * from category_option_values where id = $1", [id]);
        if(!category_option_value_check.rows[0]) next(createHttpError.NotFound("Category option value not found"));
        
        // update category option value status
        const category_option_value = await query("update category_option_values set status = $1 where id = $2 returning *", [category_option_value_check.rows[0].status === 1 ? 0 : 1, id]);

        res.status(200).json({
            data: category_option_value.rows[0],
            success: true,
            message: "Category option value status updated successfully"
        })
        
        
    } catch (error) {
        next(error);
    }

}


export { indexService, storeService, showService, updateService, destroyService, changeStatusService };
