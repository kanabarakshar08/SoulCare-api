class Response {
    constructor (req, res, type) {
        this.req = req;
        this.res = res;
        this.type = type ;
    }

    sendSuccess ({ data = null, message = 'Success', statusCode = 200 , meta_data = {}}) {
        return this.res.status(statusCode).json({
            status: true,
            message,
            data,
            ...(Object.keys(meta_data)?.length > 0 ? { meta_data } : {}),
        });

    }

    sendError ({ data = null, error = null, message, statusCode = 400 }) {
        return this.res.status(statusCode).json({
            status: false,
            message,
            error: error?.message || error || {},
        });

    }
}

export default Response;
