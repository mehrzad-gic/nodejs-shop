import createHttpError from "http-errors";
import { branchValidation, registerValidation, scheduleValidation } from "./validation.js";
import { makeSlug } from "../../Helpers/Helper.js";
import uploadQueue from "../../Queues/UpoladQueue.js";
import { status as statusType } from "../Seller/validation.js";


async function indexService(req, res, next){

    try {

        const { seller } = req.params;
        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = status.toLowerCase() || statusType.ACTIVE;
        const offset = (page - 1) * limit;

        // check if seller exists
        const seller_check = await query("select * from sellers where slug = $1", [seller]);
        if(!seller_check.rows[0]) next(createHttpError.NotFound("Seller not found"));

        const sql = "select * from branches where seller_id = $1 and status = $2 and name like '%$3%' limit $4 offset $5";
        const result = await query(sql, [seller_check.rows[0].id, status, search, limit, offset]);

        res.status(200).json({
            data: result.rows,
            pagination: {
                total: result.rows.length,
                page: page,
                limit: limit
            },
            success: true,
            message: "Branches fetched successfully"
        })
        
    } catch (error) {
        next(error)
    }

}


async function storeService(req, res, next){

    try {
     
        const { seller } = req.params;
        const { name, description, latitude, longitude, address, country_id, province_id, city_id, zip_code } = req.body;

        // validate request body
        const {error} = branchValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        // check if seller exists
        const seller_check = await query("select * from sellers where slug = $1", [seller]);
        if(!seller_check.rows[0]) next(createHttpError.NotFound("Seller not found"));
        // check if country exists
        const country_check = await query("select * from countries where id = $1", [country_id]);
        if(!country_check.rows[0]) next(createHttpError.NotFound("Country not found"));
        // check if province exists
        const province_check = await query("select * from provinces where id = $1", [province_id]);
        if(!province_check.rows[0]) next(createHttpError.NotFound("Province not found"));
        // check if city exists
        const city_check = await query("select * from cities where id = $1", [city_id]);
        if(!city_check.rows[0]) next(createHttpError.NotFound("City not found"));
        // check if branch already exists
        const branch_check = await query("select * from branches where name = $1", [name]);
        if(branch_check.rows[0]) next(createHttpError.BadRequest("Branch already exists"));
        
        const slug = await makeSlug(name, "branches");

        // create branch
        const sql = "insert into branches (name, description, latitude, longitude, address, country_id, province_id, city_id, zip_code, seller_id, slug, coordinates) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ST_SetSRID(ST_MakePoint($12, $13), 4326)) returning *";
        const result = await query(sql, [name, description, latitude, longitude, address, country_id, province_id, city_id, zip_code, seller_check.rows[0].id, slug, latitude, longitude]);
        
        // upload images
        if(req.file && req.file.length > 0 && req.file.images){
            await uploadQueue.add("uploadFile", {
                files: req.file.images,
                table: "branches",
                img_field: "images",
                data: {
                    id: result.rows[0].id,
                }
            });
        }

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Branch created successfully"
        })
        
        
    } catch (error) {
        next(error)
    }

}



async function showService(req, res, next){

    try {

        const { slug } = req.params;

        // check if branch exists
        const branch_check = await query("select * from branches where slug = $1", [slug]);
        if(!branch_check.rows[0]) next(createHttpError.NotFound("Branch not found"));

        res.status(200).json({
            data: branch_check.rows[0],
            success: true,
            message: "Branch fetched successfully"
        });
        
    } catch (error) {
        next(error)
    }

}


async function updateService(req, res, next){

    try {

        const { slug } = req.params;
        const { name, description, latitude, longitude, address, country_id, province_id, city_id, zip_code } = req.body;

        // validate request body
        const {error} = branchValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        // check if branch exists
        const branch_check = await query("select * from branches where slug = $1", [slug]);
        if(!branch_check.rows[0]) next(createHttpError.NotFound("Branch not found"));
        // check if country exists
        const country_check = await query("select * from countries where id = $1", [country_id]);
        if(!country_check.rows[0]) next(createHttpError.NotFound("Country not found"));
        // check if province exists
        const province_check = await query("select * from provinces where id = $1", [province_id]);
        if(!province_check.rows[0]) next(createHttpError.NotFound("Province not found"));
        // check if city exists
        const city_check = await query("select * from cities where id = $1", [city_id]);
        if(!city_check.rows[0]) next(createHttpError.NotFound("City not found"));

        // update branch
        const sql = "update branches set name = $1, description = $2, latitude = $3, longitude = $4, address = $5, country_id = $6, province_id = $7, city_id = $8, zip_code = $9, slug = $10, coordinates = ST_SetSRID(ST_MakePoint($11, $12), 4326) where slug = $13";
        const result = await query(sql, [name, description, latitude, longitude, address, country_id, province_id, city_id, zip_code, slug, latitude, longitude, slug]);

        if(req.file && req.file.length > 0 && req.file.images){
            
            await uploadQueue.add("uploadFile", {
                files: req.file.images,
                table: "branches",
                img_field: "images",
                data: {
                    id: result.rows[0].id,
                }
            });

            if(branch_check.rows[0].images){
                await uploadQueue.add("deleteFile", {
                    files: branch_check.rows[0].images,
                });
            }

        }

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Branch updated successfully"
        })
        
    } catch (error) {
        next(error)
    }

}



async function destroyService(req, res, next){

    try {

        const { slug } = req.params;

        // check if branch exists
        const branch_check = await query("select * from branches where slug = $1", [slug]);
        if(!branch_check.rows[0]) next(createHttpError.NotFound("Branch not found"));

        // delete branch
        const sql = "delete from branches where slug = $1";
        const result = await query(sql, [slug]);

        if(branch_check.rows[0].images){
            await uploadQueue.add("deleteFile", {
                files: branch_check.rows[0].images,
            });
        }

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Branch deleted successfully"
        })
        
    } catch (error) {
        next(error)
    }

}



async function registerService(req, res, next){

    try {
 
        const seller = req.user;
        const { name, description, latitude, longitude, address, country_id, province_id, city_id, zip_code } = req.body;

        // validate request body
        const {error} = registerValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error[0].message));

        // check if seller exists
        const seller_check = await query("select * from sellers where id = $1", [seller.id]);
        if(!seller_check.rows[0]) next(createHttpError.NotFound("Seller not found"));
        
        // check if country exists
        const country_check = await query("select * from countries where id = $1", [country_id]);
        if(!country_check.rows[0]) next(createHttpError.NotFound("Country not found"));
        // check if province exists
        const province_check = await query("select * from provinces where id = $1", [province_id]);
        if(!province_check.rows[0]) next(createHttpError.NotFound("Province not found"));
        // check if city exists
        const city_check = await query("select * from cities where id = $1", [city_id]);
        if(!city_check.rows[0]) next(createHttpError.NotFound("City not found"));
        
        // check if branch already exists
        const branch_check = await query("select * from branches where name = $1", [name]);
        if(branch_check.rows[0]) next(createHttpError.BadRequest("Branch already exists"));

        const slug = await makeSlug(name, "branches");

        // create branch
        const sql = "insert into branches (name, description, latitude, longitude, address, country_id, province_id, city_id, zip_code, seller_id, slug, coordinates, status) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ST_SetSRID(ST_MakePoint($12, $13), 4326)), $14 returning *";
        const result = await query(sql, [name, description, latitude, longitude, address, country_id, province_id, city_id, zip_code, seller_check.rows[0].id, slug, latitude, longitude, statusType.PENDING]);
        
        if(req.file && req.file.length > 0 && req.file.images){
            await uploadQueue.add("uploadFile", {
                files: req.file.images,
                table: "branches",
                img_field: "images",
                data: {
                    id: result.rows[0].id,
                }
            });
        }

        res.status(201).json({
            data: result.rows[0],
            success: true,
            message: "Branch created successfully"
        })
        
    } catch (error) {
        next(error)
    }

}


async function changeStatusService(req, res, next){

    try {
        
        const { slug } = req.params;

        // check if branch exists
        const branch_check = await query("select * from branches where slug = $1", [slug]);
        if(!branch_check.rows[0]) next(createHttpError.NotFound("Branch not found"));

        const { status } = req.body;

        // validate request body
        if(!status) next(createHttpError.BadRequest("Status is required"));
        if(!Object.values(status).includes(status)) next(createHttpError.BadRequest("Invalid status"));

        // update branch status
        const sql = "update branches set status = $1 where slug = $2";
        const result = await query(sql, [status, slug]);

        res.status(200).json({
            data: result.rows[0],
            success: true,
            message: "Branch status updated successfully"
        })

    } catch (error) {
        next(error)
    }

}


async function addScheduleService(req, res, next){

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


async function showScheduleService(req, res, next){

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


async function updateScheduleService(req, res, next){

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


async function deleteScheduleService(req, res, next){

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


export { indexService, storeService, showService, updateService, destroyService, registerService, changeStatusService, addScheduleService, showScheduleService, updateScheduleService, deleteScheduleService };