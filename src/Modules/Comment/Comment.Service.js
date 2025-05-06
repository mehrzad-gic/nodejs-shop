import { query } from "../../Configs/PostgresQl.js";
import createHttpError from "http-errors";
import {commentValidation} from "./validation.js";

const indexService = async (req, res, next) => {

    try {

        let { page, limit, status, seen, orderBy, orderType } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        status = parseInt(status) || 0;
        seen = parseInt(seen) || 0;
        orderBy = orderBy || "created_at";
        orderType = orderType || "DESC";
        const offset = (page - 1) * limit;

        const sql = `
            SELECT * FROM comments
            WHERE status = $1
            AND seen = $2
            ORDER BY ${orderBy} ${orderType}
            LIMIT $3 OFFSET $4
        `;

        const result = await query(sql,[status, seen, limit, offset]);

        res.status(200).json({
            data: result.rows,
            success: true,
            pagination: {
                total: result.rows.length,
                page: page,
                limit: limit
            },
        });


    } catch (error) {
        next(error);
    }

}


const storeService = async (req, res, next) => {

    try {

        const { error } = commentValidation.validate(req.body);
        if(error) next(createHttpError.BadRequest(error.message));

        const { slug } = req.params;
        const { text, parent_id = null } = req.body;

        const post = await query(`SELECT * FROM posts WHERE slug = $1`, [slug]);
        if(!post.rows.length) next(createHttpError.NotFound("Post not found"));
        
        if(parent_id) {
            const parent = await query(`SELECT * FROM comments WHERE id = $1`, [parent_id]);
            if(!parent.rows.length) next(createHttpError.NotFound("Parent comment not found"));
        }

        const sql = `
            INSERT INTO comments (text, post_id, user_id, status, parent_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await query(sql, [text, post.rows[0].id, req.user.id, 1]);

        res.status(201).json({
            data: result.rows[0],
            success: true,
        });

    } catch (error) {
        next(error);
    }

}



const showService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const sql = `
            SELECT c.*, u.name as user_name, u.email as user_email, u.slug as user_slug, u.image as user_image, p.title as post_title, p.slug as post_slug
            FROM comments c
            LEFT JOIN users u ON u.id = c.user_id
            LEFT JOIN posts p ON p.id = c.post_id
            WHERE c.id = $1
        `;

        const result = await query(sql, [id]);

        if(!result.rows.length) next(createHttpError.NotFound("Comment not found"));

        res.status(200).json({
            data: result.rows[0],
            success: true,
        });

    } catch (error) {
        next(error);
    }

}


const updateService = async (req, res, next) => {

    try {

        const { id } = req.params;
        const { text } = req.body;

        const sql = `
            UPDATE comments SET text = $1 WHERE id = $2
            RETURNING *
        `;

        const result = await query(sql, [text, id]);

        if(!result.rows.length) next(createHttpError.NotFound("Comment not found"));
        
        res.status(200).json({
            data: result.rows[0],
            success: true,
        });

    } catch (error) {
        next(error);
    }

}


const destroyService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const sql = `
            DELETE FROM comments WHERE id = $1
            RETURNING *
        `;

        const result = await query(sql, [id]);

        // delete all child comments
        await query(`DELETE FROM comments WHERE parent_id = $1`, [id]);

        if(!result.rowCount) next(createHttpError.NotFound("Comment not found"));

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
        
    } catch (error) {
        next(error);
    }

}


const changeStatusService = async (req, res, next) => {

    try {

        const { id } = req.params;

        const comment = await query(`SELECT * FROM comments WHERE id = $1`, [id]);
        if(!comment.rows.length) next(createHttpError.NotFound("Comment not found"));

        const status = comment.rows[0].status === 1 ? 0 : 1;

        const sql = `
            UPDATE comments SET status = $1 WHERE id = $2
        `;

        await query(sql, [status, id]);

        res.status(200).json({
            success: true,
            message: "Comment status updated successfully",
        });

    } catch (error) {
        next(error);
    }

}


const getCommentByPostService = async (req, res, next) => {

    try {

        const { slug } = req.params;

        const post = await query(`SELECT * FROM posts WHERE slug = $1`, [slug]);
        if(!post.rows.length) next(createHttpError.NotFound("Post not found"));

        const sql = `
            SELECT p.name as post_name, p.slug as post_slug, c.text as comment_text, c.created_at as comment_created_at, u.name as user_name, u.slug as user_slug, u.image as user_image
            FROM comments c
            LEFT JOIN posts p ON p.id = c.post_id
            LEFT JOIN users u ON u.id = c.user_id
            WHERE c.post_id = $1
            ORDER BY c.created_at DESC
        `;

        const result = await query(sql, [post.rows[0].id]);

        res.status(200).json({
            data: result.rows,
            success: true,
        });

    } catch (error) {
        next(error);
    }

}
export { indexService, storeService, showService, updateService, destroyService, changeStatusService, getCommentByPostService };