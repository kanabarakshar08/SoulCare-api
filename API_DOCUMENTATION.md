# SoulCare API Documentation

## Overview
SoulCare is a comprehensive mental health platform API that provides therapy booking, AI chatbot support, payment processing, and administrative features.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles
- **Patient**: Can book appointments, use chatbot, make payments
- **Doctor**: Can create therapies, manage appointments, view patient data
- **Admin**: Full access to all features and analytics

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/signup`

Register a new user (patient, doctor, or admin).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "patient", // patient, doctor, admin
  "specialization": "Clinical Psychology", // for doctors
  "license_number": "PSY123456", // for doctors
  "experience_years": 5, // for doctors
  "bio": "Experienced therapist...", // for doctors
  "department": "Mental Health" // for admins
}
```

### Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "is_remember": false,
  "fcm_token": "optional_fcm_token"
}
```

### Logout
**GET** `/auth/logout`

Logout and invalidate token.

---

## 🧠 AI ChatBot Endpoints

### Send Message
**POST** `/chatbot/send-message`

Send a message to the AI chatbot.

**Request Body:**
```json
{
  "message": "I've been feeling anxious lately",
  "session_id": "optional_session_id"
}
```

### Get Conversation History
**GET** `/chatbot/conversation/:session_id`

Get conversation history for a session.

### Get User Sessions
**GET** `/chatbot/sessions`

Get all user's conversation sessions.

### Start New Session
**POST** `/chatbot/start-session`

Start a new conversation session.

### Get User Insights
**GET** `/chatbot/insights`

Get personal mental health insights.

---

## 🏥 Therapy Endpoints

### Create Therapy (Doctor Only)
**POST** `/therapy`

Create a new therapy service.

**Request Body:**
```json
{
  "title": "Cognitive Behavioral Therapy",
  "description": "Evidence-based therapy for anxiety and depression",
  "category": "cognitive_behavioral",
  "duration_minutes": 60,
  "price": 150.00,
  "currency": "USD",
  "is_online": true,
  "is_in_person": true,
  "max_participants": 1,
  "requirements": ["Initial consultation required"],
  "benefits": ["Reduced anxiety", "Better coping skills"],
  "tags": ["anxiety", "depression", "cbt"],
  "availability": {
    "monday": [{"start_time": "09:00", "end_time": "17:00", "is_available": true}],
    "tuesday": [{"start_time": "09:00", "end_time": "17:00", "is_available": true}]
  }
}
```

### Get All Therapies
**GET** `/therapy`

Get all available therapies with filters.

**Query Parameters:**
- `page`, `limit`: Pagination
- `category`: Filter by category
- `min_price`, `max_price`: Price range
- `is_online`, `is_in_person`: Session type
- `search`: Text search
- `sort_by`: Sort by rating, price, created
- `sort_order`: asc or desc

### Get Therapy by ID
**GET** `/therapy/:id`

Get specific therapy details.

### Update Therapy (Doctor Only)
**PUT** `/therapy/:id`

Update therapy information.

### Delete Therapy (Doctor Only)
**DELETE** `/therapy/:id`

Delete (deactivate) therapy.

### Get Doctor's Therapies
**GET** `/therapy/doctor/:doctorId`

Get all therapies by a specific doctor.

### Search Therapies
**GET** `/therapy/search`

Search therapies with advanced filters.

---

## 📅 Appointment Endpoints

### Book Appointment (Patient Only)
**POST** `/appointments/book`

Book a new appointment.

**Request Body:**
```json
{
  "doctor_id": "doctor_id_here",
  "therapy_id": "therapy_id_here",
  "appointment_date": "2024-01-15",
  "start_time": "10:00",
  "end_time": "11:00",
  "session_type": "online",
  "notes": "First session",
  "patient_notes": "Feeling anxious about work"
}
```

### Get Patient Appointments
**GET** `/appointments/patient`

Get all appointments for the logged-in patient.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `upcoming`: Get only upcoming appointments

### Get Doctor Appointments
**GET** `/appointments/doctor/schedule`

Get all appointments for the logged-in doctor.

### Get Appointment by ID
**GET** `/appointments/:id`

Get specific appointment details.

### Cancel Appointment
**POST** `/appointments/:id/cancel`

Cancel an appointment.

**Request Body:**
```json
{
  "reason": "Schedule conflict"
}
```

### Update Appointment Status (Doctor Only)
**PUT** `/appointments/:id/status`

Update appointment status.

**Request Body:**
```json
{
  "status": "completed",
  "doctor_notes": "Session went well"
}
```

### Get Available Time Slots
**GET** `/appointments/available-slots`

Get available time slots for a doctor.

**Query Parameters:**
- `doctorId`: Doctor ID
- `date`: Date (YYYY-MM-DD)
- `duration`: Session duration in minutes

### Rate Appointment (Patient Only)
**POST** `/appointments/:id/rate`

Rate a completed appointment.

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Great session, very helpful"
}
```

---

## 💬 Contact Us Endpoints

### Submit Contact Form
**POST** `/contact/submit`

Submit a contact form (no authentication required).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Appointment Help",
  "message": "I need help booking an appointment",
  "category": "appointment_help"
}
```

### Get All Contacts (Admin Only)
**GET** `/contact`

Get all contact submissions.

### Get Contact by ID (Admin Only)
**GET** `/contact/:id`

Get specific contact details.

### Assign Contact (Admin Only)
**POST** `/contact/:id/assign`

Assign contact to staff member.

### Respond to Contact (Admin Only)
**POST** `/contact/:id/respond`

Respond to contact.

### Get Contact Statistics (Admin Only)
**GET** `/contact/statistics`

Get contact analytics.

---

## 💳 Payment Endpoints

### Create Payment Intent (Patient Only)
**POST** `/payments/create-intent`

Create Stripe payment intent for appointment.

**Request Body:**
```json
{
  "appointment_id": "appointment_id_here"
}
```

### Confirm Payment (Patient Only)
**POST** `/payments/confirm`

Confirm payment completion.

**Request Body:**
```json
{
  "payment_intent_id": "pi_1234567890"
}
```

### Get Payment History (Patient Only)
**GET** `/payments/history`

Get user's payment history.

### Refund Payment (Admin Only)
**POST** `/payments/refund`

Refund a payment.

**Request Body:**
```json
{
  "appointment_id": "appointment_id_here",
  "reason": "Patient cancellation"
}
```

### Get Payment Statistics (Admin Only)
**GET** `/payments/statistics`

Get payment analytics.

### Stripe Webhook
**POST** `/payments/webhook`

Handle Stripe webhook events (no authentication).

---

## 📊 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  phone: String,
  role: String, // patient, doctor, admin
  is_admin: Boolean,
  is_verified: Boolean,
  last_login_at: Date,
  created_at: Date,
  updated_at: Date
}
```

### Therapy Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  duration_minutes: Number,
  price: Number,
  currency: String,
  doctor_id: ObjectId,
  is_active: Boolean,
  is_online: Boolean,
  is_in_person: Boolean,
  max_participants: Number,
  requirements: [String],
  benefits: [String],
  tags: [String],
  availability: Object,
  rating: {
    average: Number,
    count: Number
  }
}
```

### Appointment Model
```javascript
{
  _id: ObjectId,
  patient_id: ObjectId,
  doctor_id: ObjectId,
  therapy_id: ObjectId,
  appointment_date: Date,
  start_time: String,
  end_time: String,
  duration_minutes: Number,
  status: String,
  session_type: String,
  meeting_link: String,
  location: String,
  notes: String,
  price: Number,
  currency: String,
  payment_status: String,
  payment_id: String,
  rating: {
    patient_rating: Number,
    patient_feedback: String,
    doctor_rating: Number,
    doctor_feedback: String
  }
}
```

---

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation with Joi
- Password encryption
- Rate limiting
- CORS protection
- Stripe webhook verification

---

## 🌐 Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/soulcare

# JWT
JWT_PRIVATE_KEY=your_jwt_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=3000
NODE_ENV=development
```

---

## 📱 Frontend Integration

### Website Contact Form
The contact form at `https://www-soul-care.netlify.app/contact` can submit to:
```
POST /api/contact/submit
```

### User Registration Flow
1. Patient registers: `POST /api/auth/signup` with `role: "patient"`
2. Doctor registers: `POST /api/auth/signup` with `role: "doctor"` and additional fields
3. Admin registers: `POST /api/auth/signup` with `role: "admin"`

### Appointment Booking Flow
1. Patient browses therapies: `GET /api/therapy`
2. Patient books appointment: `POST /api/appointments/book`
3. Patient creates payment: `POST /api/payments/create-intent`
4. Patient confirms payment: `POST /api/payments/confirm`

---

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Start MongoDB
4. Run the server: `npm start`
5. Test endpoints using the provided examples

---

## 📞 Support

For technical support or questions, contact the development team or use the contact form at `https://www-soul-care.netlify.app/contact`.
