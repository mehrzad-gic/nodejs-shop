import { Pool } from 'pg';
import Logger from '../Helpers/Logger.js';
import dotenv from 'dotenv';
import { log } from 'console';
dotenv.config()

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const pool = new Pool({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    max: 20, // Max connections (default: 10)
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Fail fast if can't connect
});


export async function query(sql, params, extra = true) {

    const client = await pool.connect();

    try {
        
        const result = await client.query(sql, params);

        if(extra) return result?.rows?.length > 0 ? result?.rows : false;
        
        return result;
            
    } catch (e) {
        Logger.error(`Query failed: ${e}`);
        throw e; // Preserve stack trace
    } finally {
        await client.release();
    }

}


export async function transaction(queries) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');
        const results = [];
        for (const { sql, params } of queries) {
            results.push(await client.query(sql, params));
        }
        await client.query('COMMIT');
        return results;

    } catch (e) {

        await client.query('ROLLBACK').catch(() => {}); // Silent rollback fail
        Logger.error(`Transaction failed: ${e}`);
        throw e;

    } finally {
        await client.release();
    }

}



//! remember use client.release() -- to connection be reuseable 
export async function postgresQlClient() {
    
    try {

        const client = await pool.connect();

        Logger.info('PostgresQl Client is ready');

        return client;

    } catch(e) {
        Logger.error(`Client Error: ${e}`);
        throw new Error(`PostgreSQL connection failed: ${e.message}`, { cause: e });
    }

    /* usage
    const client = await postgresQlClient();
    
    try{
    
        // sample query
        await client.query("SELECT name,id,user_name FROM users WHERE id = $1 AND email = $2",[1,"example@gmail.com"])

    } catch(e){
        console.log(e)
    }
    finally {
        await client.release()
    }
     
    */

}



export default pool;