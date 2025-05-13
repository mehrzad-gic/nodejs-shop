import createHttpError from "http-errors";
import { scheduleValidation } from "./validation.js";
import { query } from "../../Configs/PostgresQl.js";


async function indexService(req, res, next){

    try {
        
        const { slug } = req.params;

        // check if branch exists
        const branch_check = await query("select * from branches where slug = $1", [slug]);
        if(!branch_check.rows[0]) next(createHttpError.NotFound("Branch not found"));

        // get branch schedule
        const branch_schedule_check = await query("select * from branch_schedules where branch_id = $1", [branch_check.rows[0].id]);

        res.status(200).json({
            data: branch_schedule_check.rows[0],
            success: true,
            message: "Branch schedule fetched successfully"
        })

    } catch (error) {
        next(error);
    }

}


async function storeService(req, res, next){

    try {
 
        const { slug } = req.params;

        // check if branch exists
        const branch_check = await query("select * from branches where slug = $1", [slug]);
        if(!branch_check.rows[0]) next(createHttpError.NotFound("Branch not found"));
        
        const { open_days, opening_time, closing_time, weekend_opening_time, weekend_closing_time } = req.body;

        // validate request body
        const {error} = scheduleValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        // check if branch_schedule with same branch_id exists
        const branch_schedule_check = await query("select * from branch_schedules where branch_id = $1", [branch_check.rows[0].id]);
        if(branch_schedule_check.rows[0]) next(createHttpError.BadRequest("Branch schedule with same branch_id already exists"));

        // create branch schedule
        const sql = "insert into branch_schedules (branch_id, open_days, opening_time, closing_time, weekend_opening_time, weekend_closing_time) values ($1, $2, $3::time, $4::time, $5::time, $6::time) returning *";
        const result = await query(sql, [branch_check.rows[0].id, open_days, opening_time, closing_time, weekend_opening_time, weekend_closing_time]);
        
        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Branch schedule created successfully"
        })
        
    } catch (error) {
        next(error);
    }

}


async function showService(req, res, next){

    try {

        const { id } = req.params;

        // check if branch schedule exists
        const branch_schedule_check = await query("select * from branch_schedules where id = $1", [id]);
        if(!branch_schedule_check.rows[0]) next(createHttpError.NotFound("Branch schedule not found"));

        res.status(200).json({
            data: branch_schedule_check.rows[0],
            success: true,
            message: "Branch schedule fetched successfully"
        })

    } catch (error) {
        next(error);
    }

}


async function updateService(req, res, next){

    try {
        
        const { id } = req.params;

        // check if branch schedule exists
        const branch_schedule_check = await query("select * from branch_schedules where id = $1", [id]);
        if(!branch_schedule_check.rows[0]) next(createHttpError.NotFound("Branch schedule not found"));

        const { open_days, opening_time, closing_time, weekend_opening_time, weekend_closing_time } = req.body;

        // validate request body
        const {error} = scheduleValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));
        
        // update branch schedule
        const sql = "update branch_schedules set open_days = $1, opening_time = $2::time, closing_time = $3::time, weekend_opening_time = $4::time, weekend_closing_time = $5::time where id = $6";
        const result = await query(sql, [open_days, opening_time, closing_time, weekend_opening_time, weekend_closing_time, id]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Branch schedule updated successfully"
        })
        
    } catch (error) {
        next(error);
    }

}


async function destroyService(req, res, next){

    try {

        const { id } = req.params;

        // check if branch schedule exists
        const branch_schedule_check = await query("select * from branch_schedules where id = $1", [id]);
        if(!branch_schedule_check.rows[0]) next(createHttpError.NotFound("Branch schedule not found"));
        
        // delete branch schedule
        const sql = "delete from branch_schedules where id = $1";
        const result = await query(sql, [id]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Branch schedule deleted successfully"
        })

    } catch (error) {
        next(error);
    }

}


export { indexService, storeService, showService, updateService, destroyService };