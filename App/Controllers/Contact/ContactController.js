import Contact from '../../Models/Contact.js';
import User from '../../Models/User.js';
import Response from '../../utils/response.js';
import { ROLES } from '../../utils/Enum.js';

class ContactController {
    // Submit contact form
    submitContact = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const {
                name,
                email,
                phone,
                subject,
                message,
                category = 'general_inquiry',
                source = 'website'
            } = req.body;

            const contact = new Contact({
                name,
                email,
                phone,
                subject,
                message,
                category,
                source,
                user_id: req.userId || null,
                ip_address: req.clientIp || req.ip,
                user_agent: req.get('User-Agent')
            });

            await contact.save();

            return response.sendSuccess({
                statusCode: 201,
                message: 'Your message has been submitted successfully. We will get back to you soon!',
                data: {
                    contact_id: contact._id,
                    status: contact.status,
                    priority: contact.priority
                }
            });

        } catch (error) {
            console.error('Error submitting contact:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to submit contact form',
                error: error.message
            });
        }
    };

    // Get all contacts (Admin/Staff only)
    getAllContacts = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const {
                page = 1,
                limit = 10,
                status,
                priority,
                category,
                assigned_to,
                search,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = req.query;

            const skip = (page - 1) * limit;
            const filters = {};

            // Apply filters
            if (status) filters.status = status;
            if (priority) filters.priority = priority;
            if (category) filters.category = category;
            if (assigned_to) filters.assigned_to = assigned_to;

            // Build sort object
            const sort = {};
            sort[sort_by] = sort_order === 'desc' ? -1 : 1;

            let query = Contact.find(filters)
                .populate('user_id', 'first_name last_name email')
                .populate('assigned_to', 'first_name last_name email')
                .populate('responded_by', 'first_name last_name email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            // Apply text search if provided
            if (search) {
                query = query.find({ $text: { $search: search } });
            }

            const contacts = await query;
            const total = await Contact.countDocuments(filters);

            return response.sendSuccess({
                message: 'Contacts retrieved successfully',
                data: {
                    contacts,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total / limit),
                        total_contacts: total,
                        has_next: page < Math.ceil(total / limit),
                        has_prev: page > 1
                    }
                }
            });

        } catch (error) {
            console.error('Error getting contacts:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve contacts',
                error: error.message
            });
        }
    };

    // Get contact by ID
    getContactById = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;

            const contact = await Contact.findById(id)
                .populate('user_id', 'first_name last_name email')
                .populate('assigned_to', 'first_name last_name email')
                .populate('responded_by', 'first_name last_name email');

            if (!contact) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Contact not found'
                });
            }

            return response.sendSuccess({
                message: 'Contact retrieved successfully',
                data: contact
            });

        } catch (error) {
            console.error('Error getting contact:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve contact',
                error: error.message
            });
        }
    };

    // Assign contact to staff member
    assignContact = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;
            const { staff_id } = req.body;
            const adminId = req.userId;

            const contact = await Contact.findById(id);
            if (!contact) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Contact not found'
                });
            }

            // Verify staff member exists
            const staff = await User.findById(staff_id);
            if (!staff || (staff.role !== ROLES.ADMIN && staff.role !== ROLES.DOCTOR)) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Staff member not found'
                });
            }

            await contact.assignTo(staff_id);

            return response.sendSuccess({
                message: 'Contact assigned successfully',
                data: {
                    contact_id: contact._id,
                    assigned_to: staff_id,
                    status: contact.status
                }
            });

        } catch (error) {
            console.error('Error assigning contact:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to assign contact',
                error: error.message
            });
        }
    };

    // Respond to contact
    respondToContact = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;
            const { response_text } = req.body;
            const responderId = req.userId;

            const contact = await Contact.findById(id);
            if (!contact) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Contact not found'
                });
            }

            // Check if user has permission to respond
            const canRespond = 
                contact.assigned_to && contact.assigned_to.toString() === responderId ||
                req.user.role === ROLES.ADMIN;

            if (!canRespond) {
                return response.sendError({
                    statusCode: 403,
                    message: 'You do not have permission to respond to this contact'
                });
            }

            await contact.respond(response_text, responderId);

            return response.sendSuccess({
                message: 'Response sent successfully',
                data: {
                    contact_id: contact._id,
                    status: contact.status,
                    responded_at: contact.responded_at
                }
            });

        } catch (error) {
            console.error('Error responding to contact:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to respond to contact',
                error: error.message
            });
        }
    };

    // Update contact status
    updateContactStatus = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;
            const { status, priority, tags, follow_up_required, follow_up_date } = req.body;
            const adminId = req.userId;

            const contact = await Contact.findById(id);
            if (!contact) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Contact not found'
                });
            }

            // Update fields
            if (status) contact.status = status;
            if (priority) contact.priority = priority;
            if (tags) contact.tags = tags;
            if (follow_up_required !== undefined) contact.follow_up_required = follow_up_required;
            if (follow_up_date) contact.follow_up_date = new Date(follow_up_date);

            await contact.save();

            return response.sendSuccess({
                message: 'Contact updated successfully',
                data: contact
            });

        } catch (error) {
            console.error('Error updating contact:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to update contact',
                error: error.message
            });
        }
    };

    // Close contact
    closeContact = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;
            const adminId = req.userId;

            const contact = await Contact.findById(id);
            if (!contact) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Contact not found'
                });
            }

            await contact.close();

            return response.sendSuccess({
                message: 'Contact closed successfully',
                data: {
                    contact_id: contact._id,
                    status: contact.status
                }
            });

        } catch (error) {
            console.error('Error closing contact:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to close contact',
                error: error.message
            });
        }
    };

    // Get contact statistics
    getContactStatistics = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { start_date, end_date } = req.query;

            const stats = await Contact.getStatistics(start_date, end_date);

            return response.sendSuccess({
                message: 'Contact statistics retrieved successfully',
                data: stats
            });

        } catch (error) {
            console.error('Error getting contact statistics:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve contact statistics',
                error: error.message
            });
        }
    };

    // Get contact categories
    getContactCategories = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const categories = await Contact.distinct('category');
            
            const categoryInfo = categories.map(async(category) => ({
                value: category,
                label: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                count: await Contact.countDocuments({ category })
            }));

            return response.sendSuccess({
                message: 'Contact categories retrieved successfully',
                data: categoryInfo
            });

        } catch (error) {
            console.error('Error getting contact categories:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve contact categories',
                error: error.message
            });
        }
    };

    // Get user's contacts (if logged in)
    getUserContacts = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { page = 1, limit = 10 } = req.query;
            const userId = req.userId;

            if (!userId) {
                return response.sendError({
                    statusCode: 401,
                    message: 'Authentication required'
                });
            }

            const skip = (page - 1) * limit;

            const contacts = await Contact.find({ user_id: userId })
                .populate('assigned_to', 'first_name last_name email')
                .populate('responded_by', 'first_name last_name email')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Contact.countDocuments({ user_id: userId });

            return response.sendSuccess({
                message: 'User contacts retrieved successfully',
                data: {
                    contacts,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total / limit),
                        total_contacts: total,
                        has_next: page < Math.ceil(total / limit),
                        has_prev: page > 1
                    }
                }
            });

        } catch (error) {
            console.error('Error getting user contacts:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve user contacts',
                error: error.message
            });
        }
    };
}

export default new ContactController();
