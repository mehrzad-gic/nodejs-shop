import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { productSellerValidation } from "./validation.js";
import uploadQueue from "../../Queues/UpoladQueue.js";


async function indexService(req, res, next) {

    try {

        const { slug } = req.params;

        // product
        const product = await query("select * from products where slug = $1", [slug]);
        if (product.rowCount === 0) return next(createHttpError.NotFound("Product not found"));
        

        let { page, limit, order_by = "price", order_type = "asc" } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const sql = "select * from product_sellers where product_id = $1 order by $2 $3 limit $4 offset $5";
        const result = await query(sql, [product.rows[0].id, order_by, order_type, limit, offset]);

        res.status(200).json({
            message: "Product sellers fetched successfully",
            data: result.rows,
            pagination: {
                page: page,
                limit: limit,
                total: result.rowCount,
                total_pages: Math.ceil(result.rowCount / limit)
            },
            success: true,
            product: product.rows[0]
        });

    } catch (error) {
        next(error);
    }

}


async function storeService(req, res, next) {

    try {

        const { slug } = req.params;
        const { branch_id, price, currency_code, description, status, option_values } = req.body;

        // validate
        const { error } = productSellerValidation.validate(req.body);
        if (error) return next(createHttpError.BadRequest(error.message));

        // product
        const product = await query("select * from products where slug = $1", [slug]);
        if (product.rowCount === 0) return next(createHttpError.NotFound("Product not found"));

        // branch
        const branch = await query("select * from branches where id = $1", [branch_id]);
        if (branch.rowCount === 0) return next(createHttpError.NotFound("Branch not found"));

        // check if branch is open
        const branchOpen = await query("select * from branches where id = $1 and open = true", [branch_id]);
        if (branchOpen.rowCount === 0) return next(createHttpError.BadRequest("Branch is not open"));

        // if branch.status is not "active" return error
        if (branch.rows[0].status !== "active") return next(createHttpError.BadRequest("Branch is not active"));

        // check if product seller already exists
        const productSeller = await query("select * from product_sellers where product_id = $1 and branch_id = $2", [product.rows[0].id, branch_id]);
        if (productSeller.rowCount > 0) return next(createHttpError.BadRequest("Record already exists"));

        await query("begin");

        // create product seller
        const result = await query("insert into product_sellers (product_id, branch_id, price, currency_code, description, status) values ($1, $2, $3, $4, $5, $6) returning *", [product.rows[0].id, branch_id, price, currency_code, description, status]);

        // create product seller option values
        if(option_values && option_values.length > 0){
            for(const option_value of option_values){
               await query("insert into products_category_option_values (product_seller_id, option_id, value_id) values ($1, $2, $3)", [result.rows[0].id, option_value.option_id, option_value.id]);
            }
        }

        await query("commit");

        // upload images
        if(req.file && req.file.length > 0 && req.file.images){
            await uploadQueue.add("uploadFile", {
                files: req.file.images,
                table: "product_sellers",
                img_field: "images",
                data: {
                    id: result.rows[0].id,
                    slug: product.rows[0].slug
                }
            });
        }

        res.status(201).json({
            message: "Product seller created successfully",
            data: result.rows[0],
            success: true
        });
        
    } catch (error) {
        await query("rollback");
        next(error);
    }

}


async function showService(req, res, next) {

    try {

        const { id } = req.params;

        // product seller
        const sql = `
            select ps.*
            json_build_object(
                'name', b.name,
                'slug', b.slug,
                'images', b.images
            ) as branch,
            json_build_object(
                'name', p.name,
                'slug', p.slug,
                'image', p.image
            ) as product,
            json_agg(
                json_build_object(
                    'name', co.name,
                    'slug', cov.slug
                )
            ) as option_values,
            from product_sellers ps 
            left join branches b on ps.branch_id = b.id 
            left join products p on ps.product_id = p.id 
            left join products_category_option_values pcov on ps.id = pcov.product_seller_id
            left join category_options co on pcov.option_id = co.id
            left join category_option_values cov on pcov.value_id = cov.id
            where ps.id = $1
        `;
        const productSeller = await query(sql, [id]);
        if (productSeller.rowCount === 0) return next(createHttpError.NotFound("Product seller not found"));

        res.status(200).json({
            message: "Product seller fetched successfully",
            data: productSeller.rows[0],
            success: true
        });

    } catch (error) {
        next(error);
    }

}



async function updateService(req, res, next) {

    try {

        const { id } = req.params;
        const { branch_id, price, currency_code, description, status, option_values } = req.body;

        // validate
        const { error } = productSellerValidation.validate(req.body);
        if (error) return next(createHttpError.BadRequest(error.message));

        // product seller
        const productSeller = await query("select * from product_sellers where id = $1", [id]);
        if (productSeller.rowCount === 0) return next(createHttpError.NotFound("Product seller not found"));

        // branch
        const branch = await query("select * from branches where id = $1", [branch_id]);
        if (branch.rowCount === 0) return next(createHttpError.NotFound("Branch not found"));
        
        await query("begin");
        // update product seller
        const result = await query("update product_sellers set branch_id = $1, price = $2, currency_code = $3, description = $4, status = $5 where id = $6 returning *", [branch_id, price, currency_code, description, status, id]);

        // update product seller option values
        if(option_values && option_values.length > 0){
            await query("delete from products_category_option_values where product_seller_id = $1", [id]);
            for(const option_value of option_values){
                await query("insert into products_category_option_values (product_seller_id, option_id, value_id) values ($1, $2, $3)", [id, option_value.option_id, option_value.id]);
            }
        }

        await query("commit");

        // upload images
        if(req.file && req.file.length > 0 && req.file.images){
        
            // upload new images
            await uploadQueue.add("uploadFile", {
                files: req.file.images,
                table: "product_sellers",
                img_field: "images",
                data: {
                    id: result.rows[0].id,
                    slug: productSeller.rows[0].slug
                }
            });

            // delete old images
            if(productSeller.rows[0].images){
                await uploadQueue.add("deleteFile", {
                    file: productSeller.rows[0].images,
                });
            }
        
        }

        res.status(200).json({
            message: "Product seller updated successfully",
            data: result.rows[0],
            success: true
        });

    } catch (error) {
        await query("rollback");
        next(error);
    }

}


async function destroyService(req, res, next) {

    try {
        
        const { id } = req.params;

        // delete product seller
        const result = await query("delete from product_sellers where id = $1", [id]);
        if (result.rowCount === 0) return next(createHttpError.NotFound("Record not found"));

        // delete images
        if(result.rows[0].images){
            await uploadQueue.add("deleteFile", {
                file: result.rows[0].images,
            });
        }

        res.status(200).json({
            message: "Record deleted successfully",
            success: true
        });

    } catch (error) {
        next(error);
    }

}


async function changeStatusService(req, res, next) {

    try {

        const { id } = req.params;
        
        // product seller
        const productSeller = await query("select * from product_sellers where id = $1", [id]);
        if (productSeller.rowCount === 0) return next(createHttpError.NotFound("Record not found"));

        // change status
        const result = await query("update product_sellers set status = $1 where id = $2", [productSeller.rows[0].status === 1 ? 0 : 1, id]);

        res.status(200).json({
            message: "Status changed successfully",
            data: result.rows[0],
            success: true
        });
        
    } catch (error) {
        next(error);
    }

}

export { indexService, storeService, showService, updateService, destroyService, changeStatusService };


