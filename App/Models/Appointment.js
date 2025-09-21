import { model, Schema } from 'mongoose';

export const appointmentSchema = new Schema({
    patient_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },
    doctor_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required']
    },
    therapy_id: {
        type: Schema.Types.ObjectId,
        ref: 'Therapy',
        required: [true, 'Therapy ID is required']
    },
    appointment_date: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    start_time: {
        type: String,
        required: [true, 'Start time is required'],
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end_time: {
        type: String,
        required: [true, 'End time is required'],
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    duration_minutes: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [15, 'Minimum duration is 15 minutes'],
        max: [300, 'Maximum duration is 300 minutes']
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled'
    },
    session_type: {
        type: String,
        enum: ['online', 'in_person'],
        required: [true, 'Session type is required']
    },
    meeting_link: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    patient_notes: {
        type: String,
        maxlength: [1000, 'Patient notes cannot exceed 1000 characters']
    },
    doctor_notes: {
        type: String,
        maxlength: [1000, 'Doctor notes cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    payment_id: {
        type: String,
        default: null
    },
    payment_method: {
        type: String,
        enum: ['stripe', 'paypal', 'bank_transfer', 'cash'],
        default: 'stripe'
    },
    reminder_sent: {
        type: Boolean,
        default: false
    },
    reminder_sent_at: {
        type: Date,
        default: null
    },
    cancellation_reason: {
        type: String,
        maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    cancelled_by: {
        type: String,
        enum: ['patient', 'doctor', 'admin', 'system']
    },
    cancelled_at: {
        type: Date,
        default: null
    },
    rescheduled_from: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null
    },
    rescheduled_to: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null
    },
    rating: {
        patient_rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        patient_feedback: {
            type: String,
            maxlength: [500, 'Patient feedback cannot exceed 500 characters']
        },
        doctor_rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        doctor_feedback: {
            type: String,
            maxlength: [500, 'Doctor feedback cannot exceed 500 characters']
        }
    }
}, {
    timestamps: true
});

// Indexes for better performance
appointmentSchema.index({ patient_id: 1, appointment_date: 1 });
appointmentSchema.index({ doctor_id: 1, appointment_date: 1 });
appointmentSchema.index({ therapy_id: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointment_date: 1, start_time: 1 });
appointmentSchema.index({ payment_status: 1 });

// Virtual for formatted appointment time
appointmentSchema.virtual('formatted_time').get(function() {
    return `${this.start_time} - ${this.end_time}`;
});

// Virtual for formatted price
appointmentSchema.virtual('formatted_price').get(function() {
    return `${this.currency} ${this.price.toFixed(2)}`;
});

// Method to check if appointment is in the past
appointmentSchema.methods.isPast = function() {
    const now = new Date();
    const appointmentDateTime = new Date(`${this.appointment_date.toISOString().split('T')[0]}T${this.start_time}:00`);
    return appointmentDateTime < now;
};

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
    const now = new Date();
    const appointmentDateTime = new Date(`${this.appointment_date.toISOString().split('T')[0]}T${this.start_time}:00`);
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
    
    return this.status === 'scheduled' && hoursUntilAppointment > 24;
};

// Method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
    const now = new Date();
    const appointmentDateTime = new Date(`${this.appointment_date.toISOString().split('T')[0]}T${this.start_time}:00`);
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
    
    return this.status === 'scheduled' && hoursUntilAppointment > 2;
};

// Static method to get available time slots
appointmentSchema.statics.getAvailableSlots = async function(doctorId, date, duration = 60) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing appointments for the day
    const existingAppointments = await this.find({
        doctor_id: doctorId,
        appointment_date: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: { $nin: ['cancelled', 'no_show'] }
    }).select('start_time end_time');

    // Generate available slots (assuming 9 AM to 6 PM working hours)
    const availableSlots = [];
    const workingHours = [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' },
        { start: '12:00', end: '13:00' },
        { start: '13:00', end: '14:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
        { start: '17:00', end: '18:00' }
    ];

    for (const slot of workingHours) {
        const isAvailable = !existingAppointments.some(apt => 
            (slot.start >= apt.start_time && slot.start < apt.end_time) ||
            (slot.end > apt.start_time && slot.end <= apt.end_time) ||
            (slot.start <= apt.start_time && slot.end >= apt.end_time)
        );

        if (isAvailable) {
            availableSlots.push({
                start_time: slot.start,
                end_time: slot.end,
                duration: 60
            });
        }
    }

    return availableSlots;
};

// Pre-save middleware to validate appointment
appointmentSchema.pre('save', function(next) {
    // Validate that end time is after start time
    const startTime = new Date(`2000-01-01T${this.start_time}:00`);
    const endTime = new Date(`2000-01-01T${this.end_time}:00`);
    
    if (endTime <= startTime) {
        return next(new Error('End time must be after start time'));
    }

    // Validate duration matches time difference
    const timeDiff = (endTime - startTime) / (1000 * 60); // in minutes
    if (Math.abs(timeDiff - this.duration_minutes) > 5) { // Allow 5 minute tolerance
        return next(new Error('Duration does not match time difference'));
    }

    next();
});

const Appointment = model('Appointment', appointmentSchema);

export default Appointment;
