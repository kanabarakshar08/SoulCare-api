import 'express-async-errors';

export const errorHandler = (error, req, res, next) => {
    const response = new Response(req, res, req.type);
    let errors = {};

    if (error.isJoi) {
        switch (req.type) {
            case 'mobile':
                error.details.forEach((el) => {
                    errors = el.message.replace(/['"]/g, '');
                });
                break;
            default:
                error.details.forEach((el) => {
                    const key = el.path.join('_');
                    errors[key] = el.message.replace(/['"]/g, '');
                });
        }
       
        
        return response.sendError({
            statusCode: 422,
            error: errors
        });


    }

    if (error.errors) {
        Object.keys(error.errors).forEach((key) => {
            errors[key] = error.errors[key].message.replace(/['"]/g, '');
        });

        return response.sendError({
            statusCode: 403,
            message: errors,
            error: errors
        });
    }

    if (error.message) {
        return response.sendError({
            statusCode: 403,
            message: error.message,
            error: error
        });
    }

    return response.sendError({
        statusCode: 500,
        message: 'Internal Server Error',
        error: errors
    });
};
