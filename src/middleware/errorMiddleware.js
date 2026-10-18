const notFound = (req, res, next) => { //handle requests to endpoints that do not exist (404)
    const error = new Error(`Resource not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

//global error-handling middleware
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    if(err.name === 'CastError' && err.kind === 'ObjectId'){//invalid objectid format
        statusCode = 400;
        message = 'Invalid resource identifier format';
    }
    
    if(err.code === 11000){ //dup keys violation
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    if(err.name === 'ValidationError'){ //schema validation failed
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }

    res.status(statusCode).json({
        success : false,
        message,
        ...errorHandler(process.env.NODE_ENV !== 'production' && {stack : err.stack}), ///only reveal stack traces during local development
    });
};

module.exports = {notFound, errorHandler};