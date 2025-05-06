import { postgresQlClient,query } from "../../Configs/PostgresQl.js";
import { postValidation } from "./validation.js";
import createHttpError from "http-errors";
import { makeSlug } from "../../Helpers/Helper.js";
import uploadQueue from "../../Queues/UpoladQueue.js";


export const indexService = async (req, res, next) => {

    try {

        let { page, limit, search, status } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        search = search.toLowerCase() || "";
        status = parseInt(status) || 1;
        const offset = (page - 1) * limit;

        const sql = "select * from posts where status = $1 and slug ilike $2 limit $3 offset $4";
        const result = await query(sql, [status, `%${search}%`, limit, offset]);

        res.status(200).json({
            message: "Posts fetched successfully",
            pagination: {
                page,
                limit,
                total: result.rows.length,
                totalPages: Math.ceil(result.rows.length / limit),
            },
            success: true,
            data: result.rows,
        });

    } catch (error) {
        next(error);
    }
}


export const storeService = async (req, res, next) => {

    const client = await postgresQlClient();
    try {

        const { error } = postValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const { name, description, status,tags } = req.body;

        const slug = await makeSlug(name, "posts");

        await client.query('BEGIN');

        // insert post transaction
        const sql = "insert into posts (name, slug, description, status) values ($1, $2, $3, $4) returning *";
        const result = await client.query(sql, [name, slug, description, status]);

        if(result.rows.length === 0) {
            await client.query('ROLLBACK');
            next(createHttpError.BadRequest("Post not created"));
        }
        
        if(tags && tags.length > 0) {

            tags.forEach(async (tag) => {

                const postTag = await client.query("insert into post_tag (post_id, tag_id) values ($1, $2) returning *", [result.rows[0].id, tag]);

                if(postTag.rows.length === 0) {
                    await client.query('ROLLBACK');
                    next(createHttpError.BadRequest("Tag not found"));
                }

            });

        }

        // upload image
        if(req.file) {
            await uploadQueue.add("upload", {
                files: [req.file?.image],
                table: "posts",
                img_field: "image",
                data: {
                    id: result.rows[0].id,
                    image: req.file.image,
                },
            });
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: "Post created successfully",
            success: true,
            data: result.rows[0],
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }

}


export const showService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const query = "select * from posts where slug = $1";
        const result = await postgresQlClient.query(query, [slug]);

        if(result.rows.length === 0) next(createHttpError.NotFound("Post not found"));

        res.status(200).json({
            message: "Post fetched successfully",
            success: true,
            data: result.rows[0],
        });

    } catch (error) {
        next(error);
    }
}



export const updateService = async (req, res, next) => {

    const client = await postgresQlClient();

    try {

        const { slug } = req.params;

        const { error } = postValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const post = await postgresQlClient.query("select * from posts where slug = $1", [slug]);
        if(post.rows.length === 0) next(createHttpError.NotFound("Post not found"));

        const { name, description, status, tags } = req.body;

        await client.query('BEGIN');

        const sql = "update posts set name = $1, slug = $2, description = $3, status = $4 where id = $5 returning *";
        const result = await client.query(sql, [name, slug, description, status, post.rows[0].id]);

        if(result.rows.length === 0) {
            await client.query('ROLLBACK');
            next(createHttpError.BadRequest("Post not updated"));
        }

        if(tags && tags.length > 0) {

            // remove all tags
            await client.query("delete from post_tag where post_id = $1", [post.rows[0].id]);

            tags.forEach(async (tag) => {
                
                const postTag = await client.query("insert into post_tag (post_id, tag_id) values ($1, $2) returning *", [post.rows[0].id, tag]);

                if(postTag.rows.length === 0) {
                    await client.query('ROLLBACK');
                    next(createHttpError.BadRequest("Tag not found"));
                }
            });
        }

        // upload image
        if(req.file) {
            
            // delete old image
            await uploadQueue.add("deleteFile", {
                file: post.rows[0].image,
            });

            await uploadQueue.add("upload", {
                files: [req.file?.image],
                table: "posts",
                img_field: "image",
                data: {
                    id: post.rows[0].id,
                    image: req.file.image,
                },
            });
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: "Post updated successfully",
            success: true,
            data: result.rows[0],
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }

}


export const destroyService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const post = await query("select * from posts where slug = $1", [slug]);
        if(post.rows.length === 0) next(createHttpError.NotFound("Post not found"));

        await query("delete from posts where id = $1", [post.rows[0].id]);

        res.status(200).json({
            message: "Post deleted successfully",
            success: true,
        });

    } catch (error) {
        next(error);
    }

}


export const changeStatusService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const post = await query("select * from posts where slug = $1", [slug]);
        if(post.rows.length === 0) next(createHttpError.NotFound("Post not found"));

        const status = post.rows[0].status === 1 ? 0 : 1;

        await query("update posts set status = $1 where id = $2", [status, post.rows[0].id]);

        res.status(200).json({
            message: "Post status updated successfully",
            success: true,
        });

    } catch (error) {
        next(error);
    }

}


export { indexService, storeService, showService, updateService, destroyService, changeStatusService };