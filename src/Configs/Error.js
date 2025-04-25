import createHttpError from 'http-errors';

// Error Config
function Errors(app) {

    // Handle 404 errors
    app.use((req, res, next) => {
        return res.status(404).json({
            message: `Not found - ${req.originalUrl}`,
            error: "notFound",
            success: false,
        });
    });

    // Handle other errors
    app.use((error, req, res, next) => {

        console.log(error.message);
        const serverError = createHttpError.InternalServerError();
        const statusCode = error.status || serverError.status;
        const message = error.message || serverError.message;
        const success = false;
        
        // Log the error details for debugging
        // console.error(`Error: ${message}, Status Code: ${statusCode}`);

        // Check if the error is a validation error
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                statusCode: 400,
                errors: error.errors,
                success
            });
        }

        return res.status(statusCode).json({
            statusCode,
            message,
            success
        });
    });
    
}

export default Errors;