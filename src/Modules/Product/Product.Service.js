import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import { makeSlug } from "../../Helpers/Helper.js";
import uploadQueue from "../../Queues/UpoladQueue.js";
import { productValidation } from "./validation.js"


export const indexService = async (req, res, next) => {

    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        search = parseInt(search) || 1;
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const sql = "select * from products where status = $1 and slug like $2 limit $3 offset $4";
        const result = await query(sql, [status, `%${search}%`, limit, offset]);

        res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            data: result.rows,
            pagination: {
                page: page,
                limit: limit,
                total: result.rows.length,
                totalPages: Math.ceil(result.rows.length / limit)
            }
        })
        
    } catch (error) {
        next(error)
    }

}


export const storeService = async (req, res, next) => {

    try {
    
        const { error } = productValidation.validate(req.body);
        if (error) next(createHttpError.BadRequest(error.message));
        
        const { name, description, maximum_discount, status, category_id, brand_id } = req.body;
        
        const brand = await query("select * from brands where id = $1", [brand_id]);
        if (!brand.rows[0]) next(createHttpError.NotFound("Brand not found"));

        const category = await query("select * from categories where id = $1", [category_id]);
        if (!category.rows[0]) next(createHttpError.NotFound("Category not found"));

        const slug = await makeSlug(name, "products");
        
        if(req.files && req.files.length > 0 && req.files.image){
            await uploadQueue.add("uploadFile", {
                files: req.files.image,
                table: "products",
                img_field: "image",
                data: {
                    id: result.rows[0].id,
                    slug: result.rows[0].slug
                }
            });
        }

        if(req.files && req.files.length > 0 && req.files.images){
            await uploadQueue.add("uploadFile", {
                files: req.files.images,
                table: "products",
                img_field: "images",
                data: {
                    id: result.rows[0].id,
                    slug: result.rows[0].slug
                }
            });
        }

        const sql = "insert into products (name, description, maximum_discount, status, category_id, brand_id, slug) values ($1, $2, $3, $4, $5, $6, $7) returning *";
        const result = await query(sql, [name, description, maximum_discount, status, category_id, brand_id, slug]);

        res.status(201).json({
            message: "Product created successfully",
            status: true,
            success: true,
            data: result.rows[0]
        })
        
    } catch (error) {
        next(error)
    }

}


export const showService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const sql = "select * from products where slug = $1";
        const result = await query(sql, [slug]);

        if (!result.rows[0]) next(createHttpError.NotFound("Product not found"));   

        res.status(200).json({
            message: "Product fetched successfully",
            status: true,
            success: true,
            data: result.rows[0]
        })
        
    } catch (error) {
        next(error)
    }

}


export const updateService = async (req, res, next) => {

    try {
     
        const { slug } = req.params;

        const product = await query("select * from products where slug = $1", [slug]);
        if (!product.rows[0]) next(createHttpError.NotFound("Product not found"));

        const { name, description, maximum_discount, status, category_id, brand_id } = req.body;
        
        const brand = await query("select * from brands where id = $1", [brand_id]);
        if (!brand.rows[0]) next(createHttpError.NotFound("Brand not found"));

        const category = await query("select * from categories where id = $1", [category_id]);
        if (!category.rows[0]) next(createHttpError.NotFound("Category not found"));
        
        const sql = "update products set name = $1, description = $2, maximum_discount = $3, status = $4, category_id = $5, brand_id = $6 where slug = $7";
        const result = await query(sql, [name, description, maximum_discount, status, category_id, brand_id, slug]);

        if(req.files && req.files.length > 0 && req.files.image){
            await uploadQueue.add("uploadFile", {
                files: req.files.image,
                table: "products",
                img_field: "image",
                data: {
                    id: product.rows[0].id,
                    slug: product.rows[0].slug
                }
            });
            if(product.rows[0].image){
                await uploadQueue.add("deleteFile", {
                    file: product.rows[0].image,
                });
            }
        }

        if(req.files && req.files.length > 0 && req.files.images){
            await uploadQueue.add("uploadFile", {
                files: req.files.images,
                table: "products",
                img_field: "images",
                data: {
                    id: product.rows[0].id,
                    slug: product.rows[0].slug
                }
            });
            if(product.rows[0].images){
                await uploadQueue.add("deleteFile", {
                    file: product.rows[0].images,
                });
            }
        }
        res.status(200).json({
            message: "Product updated successfully",
            status: true,
            success: true,
            data: result.rows[0]
        })
    } catch (error) {
        next(error)
    }

}



export const destroyService = async (req, res, next) => {

    try {
     
        const { slug } = req.params;

        const product = await query("select * from products where slug = $1", [slug]);
        if (!product.rows[0]) next(createHttpError.NotFound("Product not found"));

        const sql = "delete from products where slug = $1";
        const result = await query(sql, [slug]);

        if(product.rows[0].image){
            await uploadQueue.add("deleteFile", {
                file: product.rows[0].image,
            });
        }

        if(product.rows[0].images){
            await uploadQueue.add("deleteFile", {
                file: product.rows[0].images,
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            success: true,
            data: result.rows[0]
        })
        
    } catch (error) {
        next(error)
    }

}


export const changeStatusService = async (req, res, next) => {

    try {
     
        const { slug } = req.params;

        const product = await query("select * from products where slug = $1", [slug]);
        if (!product.rows[0]) next(createHttpError.NotFound("Product not found"));

        const sql = "update products set status = $1 where slug = $2";
        const result = await query(sql, [product.rows[0].status === 1 ? 0 : 1, slug]);

        res.status(200).json({
            message: "Product status updated successfully",
            status: true,
            success: true,
            data: result.rows[0]
        })
        
    } catch (error) {
        next(error)
    }

}
