import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';


// Upload function to handle single or multiple files
// Upload function to handle single or multiple files
export async function uploadImages(files) {
    
    if (!files || (Array.isArray(files) && files.length === 0)) throw new Error('No image files provided');
    
    const fileArray = Array.isArray(files) ? files : [files];
    
    const uploadPromises = fileArray.map(file => {

        return new Promise((resolve, reject) => {
 
            // Log the entire file object for inspection
            console.log('File object:', file);

            // Check if file.buffer is a Buffer
            let buffer;
            if (Buffer.isBuffer(file.buffer)) {
                buffer = file.buffer;
            } else if (file.buffer && file.buffer.data) {
                // If file.buffer is an object, extract the data
                buffer = Buffer.from(file.buffer.data);
            } else {
                console.error('Invalid buffer type:', file.buffer);
                return reject(new Error('Invalid buffer type'));
            }

            // Create a readable stream from the buffer
            const stream = new Readable();
            stream.push(buffer); // Push the buffer data to the stream
            stream.push(null); // Signal that the stream has ended

            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'uploads' }, // Optional: Folder in Cloudinary
                (error, result) => {
                    if (error) {
                        console.error('Upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            stream.pipe(uploadStream);
        });
    });

    return await Promise.all(uploadPromises);

}

// Delete function to remove an image from Cloudinary
export async function deleteImage(publicId) {
    if (!publicId) {
        throw new Error('No public ID provided');
    }

    return await cloudinary.uploader.destroy(publicId);
}


/**
 *  
 *
import { uploadImages, deleteImage } from './fileHelper'; // Adjust the path as necessary

async function uploadImagesHandler(req, res, next) {
    try {
        const results = await uploadImages(req.files);
        res.json({
            message: 'Files uploaded successfully',
            files: results,
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
}

async function deleteImagesHandler(req, res, next) {
    try {
        const { publicIds } = req.body; // Expecting an array of public IDs
        if (!Array.isArray(publicIds) || publicIds.length === 0) {
            return res.status(400).json({ error: 'No public IDs provided' });
        }

        const deletePromises = publicIds.map(id => deleteImage(id));
        await Promise.all(deletePromises);

        res.json({
            message: 'Files deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting files:', error);
        res.status(500).json({ error: 'Failed to delete files' });
    }
}

export default {
    uploadImagesHandler,
    deleteImagesHandler,
};


import express from 'express';
import { uploadSingle, uploadMultiple } from './middleware'; // Adjust the path as necessary
import controller from './controller'; // Adjust the path as necessary

const router = express.Router();

// Route for single file upload
router.post('/upload/single', uploadSingle, controller.uploadImagesHandler);

// Route for multiple files upload
router.post('/upload/multiple', uploadMultiple, controller.uploadImagesHandler);

// Route for deleting images
router.delete('/delete', controller.deleteImagesHandler);

export default router;

 * 
 */