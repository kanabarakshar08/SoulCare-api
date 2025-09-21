import Therapy from '../../Models/Therapy.js';
import User from '../../Models/User.js';
import Response from '../../utils/response.js';
import { ROLES } from '../../utils/Enum.js';

// Create new therapy (Doctor only)
const createTherapy = async (req, res) => {
    const response = new Response(req, res);

    try {
        const {
            title,
            description,
            category,
            duration_minutes,
            price,
            currency = 'USD',
            is_online = false,
            is_in_person = true,
            max_participants = 1,
            requirements = [],
            benefits = [],
            tags = [],
            images = [],
            availability = {}
        } = req.body;

        const doctorId = req.userId;

        // Verify user is a doctor
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== ROLES.DOCTOR) {
            return response.sendError({
                statusCode: 403,
                message: 'Only doctors can create therapies'
            });
        }

        const therapy = new Therapy({
            title,
            description,
            category,
            duration_minutes,
            price,
            currency,
            doctor_id: doctorId,
            is_online,
            is_in_person,
            max_participants,
            requirements,
            benefits,
            tags,
            images,
            availability
        });

        await therapy.save();

        return response.sendSuccess({
            statusCode: 201,
            message: 'Therapy created successfully',
            data: therapy
        });

    } catch (error) {
        console.error('Error creating therapy:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to create therapy',
            error: error.message
        });
    }
};

// Get all therapies with filters
const getAllTherapies = async (req, res) => {
    const response = new Response(req, res);

    try {
        const {
            page = 1,
            limit = 10,
            category,
            min_price,
            max_price,
            is_online,
            is_in_person,
            search,
            sort_by = 'rating',
            sort_order = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;
        const filters = { is_active: true };

        // Apply filters
        if (category) filters.category = category;
        if (is_online !== undefined) filters.is_online = is_online === 'true';
        if (is_in_person !== undefined) filters.is_in_person = is_in_person === 'true';
        if (min_price || max_price) {
            filters.price = {};
            if (min_price) filters.price.$gte = parseFloat(min_price);
            if (max_price) filters.price.$lte = parseFloat(max_price);
        }

        // Build sort object
        const sort = {};
        if (sort_by === 'rating') {
            sort['rating.average'] = sort_order === 'desc' ? -1 : 1;
        } else if (sort_by === 'price') {
            sort.price = sort_order === 'desc' ? -1 : 1;
        } else if (sort_by === 'created') {
            sort.createdAt = sort_order === 'desc' ? -1 : 1;
        }

        let query = Therapy.find(filters)
            .populate('doctor_id', 'first_name last_name specialization experience_years')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Apply text search if provided
        if (search) {
            query = query.find({ $text: { $search: search } });
        }

        const therapies = await query;
        const total = await Therapy.countDocuments(filters);

        return response.sendSuccess({
            message: 'Therapies retrieved successfully',
            data: {
                therapies,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / limit),
                    total_therapies: total,
                    has_next: page < Math.ceil(total / limit),
                    has_prev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting therapies:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to retrieve therapies',
            error: error.message
        });
    }
};

// Get therapy by ID
const getTherapyById = async (req, res) => {
    const response = new Response(req, res);

    try {
        const { id } = req.params;

        const therapy = await Therapy.findById(id)
            .populate('doctor_id', 'first_name last_name email specialization experience_years bio');

        if (!therapy) {
            return response.sendError({
                statusCode: 404,
                message: 'Therapy not found'
            });
        }

        return response.sendSuccess({
            message: 'Therapy retrieved successfully',
            data: therapy
        });

    } catch (error) {
        console.error('Error getting therapy:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to retrieve therapy',
            error: error.message
        });
    }
};

// Update therapy (Doctor only)
const updateTherapy = async (req, res) => {
    const response = new Response(req, res);

    try {
        const { id } = req.params;
        const updateData = req.body;
        const doctorId = req.userId;

        const therapy = await Therapy.findById(id);
        if (!therapy) {
            return response.sendError({
                statusCode: 404,
                message: 'Therapy not found'
            });
        }

        // Check if user is the owner or admin
        if (therapy.doctor_id.toString() !== doctorId && req.user.role !== ROLES.ADMIN) {
            return response.sendError({
                statusCode: 403,
                message: 'You can only update your own therapies'
            });
        }

        const updatedTherapy = await Therapy.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('doctor_id', 'first_name last_name specialization');

        return response.sendSuccess({
            message: 'Therapy updated successfully',
            data: updatedTherapy
        });

    } catch (error) {
        console.error('Error updating therapy:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to update therapy',
            error: error.message
        });
    }
};

// Delete therapy (Doctor only)
const deleteTherapy = async (req, res) => {
    const response = new Response(req, res);

    try {
        const { id } = req.params;
        const doctorId = req.userId;

        const therapy = await Therapy.findById(id);
        if (!therapy) {
            return response.sendError({
                statusCode: 404,
                message: 'Therapy not found'
            });
        }

        // Check if user is the owner or admin
        if (therapy.doctor_id.toString() !== doctorId && req.user.role !== ROLES.ADMIN) {
            return response.sendError({
                statusCode: 403,
                message: 'You can only delete your own therapies'
            });
        }

        // Soft delete by setting is_active to false
        therapy.is_active = false;
        await therapy.save();

        return response.sendSuccess({
            message: 'Therapy deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting therapy:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to delete therapy',
            error: error.message
        });
    }
};

// Get doctor's therapies
const getDoctorTherapies = async (req, res) => {
    const response = new Response(req, res);

    try {
        const { doctorId } = req.params;
        const { page = 1, limit = 10, is_active = true } = req.query;

        const skip = (page - 1) * limit;
        const filters = { doctor_id: doctorId };

        if (is_active !== undefined) {
            filters.is_active = is_active === 'true';
        }

        const therapies = await Therapy.find(filters)
            .populate('doctor_id', 'first_name last_name specialization')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Therapy.countDocuments(filters);

        return response.sendSuccess({
            message: 'Doctor therapies retrieved successfully',
            data: {
                therapies,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / limit),
                    total_therapies: total,
                    has_next: page < Math.ceil(total / limit),
                    has_prev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting doctor therapies:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to retrieve doctor therapies',
            error: error.message
        });
    }
};

// Get therapy categories
const getTherapyCategories = async (req, res) => {
    const response = new Response(req, res);

    try {
        const categories = await Therapy.distinct('category', { is_active: true });

        const categoryInfo = categories.map(async(category) =>({
            value: category,
            label: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            count: await Therapy.countDocuments({ category, is_active: true })
        }));

        return response.sendSuccess({
            message: 'Therapy categories retrieved successfully',
            data: categoryInfo
        });

    } catch (error) {
        console.error('Error getting therapy categories:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to retrieve therapy categories',
            error: error.message
        });
    }
};

// Update therapy rating
const updateTherapyRating = async (req, res) => {
    const response = new Response(req, res);

    try {
        const { id } = req.params;
        const { rating } = req.body;

        if (rating < 1 || rating > 5) {
            return response.sendError({
                statusCode: 400,
                message: 'Rating must be between 1 and 5'
            });
        }

        const therapy = await Therapy.findById(id);
        if (!therapy) {
            return response.sendError({
                statusCode: 404,
                message: 'Therapy not found'
            });
        }

        await therapy.updateRating(rating);

        return response.sendSuccess({
            message: 'Therapy rating updated successfully',
            data: {
                average_rating: therapy.rating.average,
                total_ratings: therapy.rating.count
            }
        });

    } catch (error) {
        console.error('Error updating therapy rating:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to update therapy rating',
            error: error.message
        });
    }
};

// Search therapies
const searchTherapies = async (req, res) => {
    const response = new Response(req, res);

    try {
        const {
            q: query,
            category,
            min_price,
            max_price,
            is_online,
            is_in_person,
            page = 1,
            limit = 10
        } = req.query;

        const filters = { is_active: true };

        if (category) filters.category = category;
        if (is_online !== undefined) filters.is_online = is_online === 'true';
        if (is_in_person !== undefined) filters.is_in_person = is_in_person === 'true';
        if (min_price || max_price) {
            filters.price = {};
            if (min_price) filters.price.$gte = parseFloat(min_price);
            if (max_price) filters.price.$lte = parseFloat(max_price);
        }

        const skip = (page - 1) * limit;
        const therapies = await Therapy.searchTherapies(query, filters)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Therapy.countDocuments({
            ...filters,
            ...(query && { $text: { $search: query } })
        });

        return response.sendSuccess({
            message: 'Search results retrieved successfully',
            data: {
                therapies,
                query: query || '',
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / limit),
                    total_results: total,
                    has_next: page < Math.ceil(total / limit),
                    has_prev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error searching therapies:', error);
        return response.sendError({
            statusCode: 500,
            message: 'Failed to search therapies',
            error: error.message
        });
    }
};

export default {
    createTherapy,
    getAllTherapies,
    getTherapyById,
    updateTherapy,
    deleteTherapy,
    getDoctorTherapies,
    getTherapyCategories,
    updateTherapyRating,
    searchTherapies

};

