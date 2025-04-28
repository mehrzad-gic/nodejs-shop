import { deleteImage, uploadImages } from '../Helpers/Upload.js';
import { query } from "../Configs/PostgresQl.js";
import logger from '../Helpers/Logger.js';

export async function deleteFile(job){

    const { file,files } = job.data;

    try {

        if(file) await deleteImage(JSON.parse(file)[0].public_id);
    
        if(files){
            for(value of files){
                await deleteImage(value[0].public_id);
            }
        }
    
    } catch (error) {
        logger.error('Error in job processing:', error);
        throw new Error('File upload failed: ' + error.message);
    }
}


export async function uploadFile(job) {

    const { files, table, img_field, data } = job.data;

    try {
        
        if (!files || files.length === 0) return;
        
        // Upload images to Cloudinary
        const result = await uploadImages(files);

        console.log('Upload result:', result);

        const sql = `UPDATE $1 SET $2=$3 WHERE id=$4`;
        const values = [
            table,
            img_field,
            JSON.stringify(result),
            data.id
        ];

        await query(sql, values);

    } catch (error) {
        logger.error('Error in job processing:', error);
        throw new Error('File upload failed: ' + error.message);
    }

}