import createHttpError from 'http-errors';

// Error Config
function Errors(app){

    app.use((req,res,next) => {
        return res.status(404).json({ message: `not found - ${req.originalUrl}`, error: "notFound" });
    })

    app.use((error, req, res, next) => {

        const serverError = createError.InternalServerError();
    
        const statusCode = error.status || serverError.status;
    
        const message = error.message || serverError.message;
    
        return res.status(statusCode).json({
            statusCode,
            errors: {
            message,
            },
        });
    
    });

}

export default Errors;

