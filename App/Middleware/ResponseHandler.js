export const responseHandler = (req, res, next) => {
    const originalJson = res.json;
    const originalSend = res.send;

    res.json = function (body) {
        // COMMENTED OUT: Mobile-specific response formatting
        // if (req.type === 'mobile') {
        //     body = {
        //         status: body.status || false,
        //         message: !body.status && body.error && Object.keys(body.error).length > 0 ? body.error : body.message,
        //         data: bodyFormatter(body.data || null),
        //         meta_data: body.meta_data,
        //     };
        // }
        return originalJson.call(this, body);
    };

    res.send = function (body) {
        // COMMENTED OUT: Mobile-specific response formatting for send method
        // if (req.type === 'mobile' && typeof body === 'object') {
        //     body = {
        //         status: body.status || false,
        //         message: body.message || '',
        //     };
        // }
        return originalSend.call(this, body);
    };

    next();
};

const isMongooseDoc = (val) => {
    return (
        val &&
        typeof val === 'object' &&
        typeof val.toObject === 'function' &&
        val.constructor?.name === 'model'
    );
};

const bodyFormatter = (value, visited = new WeakSet()) => {

    if (value === null || value === undefined) return null;

    // 👮‍♂️ Respect Mongoose documents
    if (isMongooseDoc(value)) return value;

    if (value && typeof value === 'object') {
        if (visited.has(value)) return null;
        visited.add(value);

        if (value._bsontype === 'ObjectId') {
            return value.toString();
        }

        if (Array.isArray(value)) {
            const formattedArray = value.map(item => bodyFormatter(item, visited));
            return formattedArray.length === 0 ? null : formattedArray;
        }

        if (value instanceof Date) {
            return value;
        }

        const formattedObj = {};
        let hasMeaningfulValue = false;

        for (const key in value) {
            const formattedValue = bodyFormatter(value[key], visited);

            // Preserve empty string but detect if any key has a meaningful (non-empty, non-null) value
            formattedObj[key] = formattedValue;
            if (
                formattedValue !== null &&
                !(typeof formattedValue === 'string' && formattedValue.trim() === '')
            ) {
                hasMeaningfulValue = true;
            }
        }

        // If none of the keys had a meaningful value, return null
        return hasMeaningfulValue ? formattedObj : null;
    }

    // Preserve empty strings, return null only for empty arrays or empty objects handled above
    if (typeof value === 'string') {
        return value;
    }

    return value;
};
