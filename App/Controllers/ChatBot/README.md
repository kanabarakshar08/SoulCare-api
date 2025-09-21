# SoulCare AI ChatBot API Documentation

## Overview
The SoulCare AI ChatBot provides mental health support through intelligent conversation analysis, risk assessment, and personalized recommendations. The system stores all conversation data in MongoDB with user associations.

## Base URL
```
/api/chatbot
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Send Message to AI ChatBot
**POST** `/send-message`

Send a message to the AI chatbot and receive a response with mental health analysis.

**Request Body:**
```json
{
  "message": "I've been feeling really anxious lately",
  "session_id": "session_1234567890" // Optional
}
```

**Response:**
```json
{
  "status": true,
  "message": "Message processed successfully",
  "data": {
    "session_id": "session_1234567890",
    "response": "I can hear that you're feeling anxious. That's completely understandable...",
    "recommendations": [
      {
        "type": "exercise",
        "title": "Breathing Exercise",
        "description": "Try the 4-7-8 breathing technique...",
        "priority": "high"
      }
    ],
    "concerns": [
      {
        "concern_type": "anxiety",
        "severity": "moderate",
        "description": "Detected keywords: anxious",
        "detected_at": "2024-01-15T10:30:00Z"
      }
    ],
    "risk_level": {
      "suicide_risk": "none",
      "self_harm_risk": "none",
      "crisis_intervention_needed": false
    },
    "should_escalate": false
  }
}
```

### 2. Get Conversation History
**GET** `/conversation/:session_id`

Retrieve the conversation history for a specific session.

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve (default: 50)

**Response:**
```json
{
  "status": true,
  "message": "Conversation history retrieved successfully",
  "data": {
    "session_id": "session_1234567890",
    "messages": [
      {
        "role": "user",
        "content": "I've been feeling really anxious lately",
        "timestamp": "2024-01-15T10:30:00Z",
        "message_type": "text"
      },
      {
        "role": "assistant",
        "content": "I can hear that you're feeling anxious...",
        "timestamp": "2024-01-15T10:30:05Z",
        "message_type": "text"
      }
    ],
    "concerns": [...],
    "risk_assessment": {...},
    "recommendations": [...]
  }
}
```

### 3. Get User Sessions
**GET** `/sessions`

Get all conversation sessions for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Sessions per page (default: 10)

**Response:**
```json
{
  "status": true,
  "message": "User sessions retrieved successfully",
  "data": {
    "sessions": [
      {
        "session_id": "session_1234567890",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "status": "active",
        "is_escalated": false,
        "message_count": 5
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_sessions": 25,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 4. Start New Session
**POST** `/start-session`

Start a new conversation session.

**Response:**
```json
{
  "status": true,
  "message": "New conversation session started",
  "data": {
    "session_id": "session_1234567890",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### 5. End Session
**POST** `/end-session/:session_id`

End a specific conversation session.

**Response:**
```json
{
  "status": true,
  "message": "Session ended successfully"
}
```

### 6. Get User Insights
**GET** `/insights`

Get mental health insights and analytics for the authenticated user.

**Response:**
```json
{
  "status": true,
  "message": "User insights retrieved successfully",
  "data": {
    "total_sessions": 5,
    "total_messages": 45,
    "most_common_concerns": {
      "anxiety": 3,
      "stress": 2,
      "sleep": 1
    },
    "highest_risk_level": "moderate"
  }
}
```

## Doctor/Admin Endpoints

### 7. Get Escalated Conversations
**GET** `/escalated`

Get all escalated conversations requiring professional attention.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Conversations per page (default: 10)
- `risk_level` (optional): Filter by risk level (low, moderate, high, critical)

**Response:**
```json
{
  "status": true,
  "message": "Escalated conversations retrieved successfully",
  "data": {
    "conversations": [
      {
        "session_id": "session_1234567890",
        "user_id": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com"
        },
        "escalated_to": null,
        "escalated_at": "2024-01-15T10:30:00Z",
        "risk_assessment": {
          "suicide_risk": "high",
          "self_harm_risk": "moderate",
          "crisis_intervention_needed": true
        },
        "mental_health_concerns": [...],
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

### 8. Assign Escalated Conversation
**POST** `/assign/:session_id`

Assign an escalated conversation to a specific doctor.

**Request Body:**
```json
{
  "doctor_id": "doctor_user_id_here"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Conversation assigned to doctor successfully"
}
```

## Admin Endpoints

### 9. Get Conversation Analytics
**GET** `/analytics`

Get platform-wide analytics for conversations and mental health trends.

**Query Parameters:**
- `start_date` (optional): Start date for analytics (YYYY-MM-DD)
- `end_date` (optional): End date for analytics (YYYY-MM-DD)

**Response:**
```json
{
  "status": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "total_conversations": 150,
    "total_messages": 2500,
    "escalated_conversations": 12,
    "high_risk_conversations": 8,
    "escalation_rate": 8.0,
    "avg_messages_per_conversation": 16.67
  }
}
```

## Mental Health Concern Types
- `anxiety` - Anxiety-related concerns
- `depression` - Depression symptoms
- `stress` - Stress and overwhelm
- `panic` - Panic attacks
- `sleep` - Sleep-related issues
- `mood` - Mood fluctuations
- `social` - Social anxiety or isolation
- `trauma` - Trauma-related concerns
- `other` - Other mental health concerns

## Risk Assessment Levels
- `none` - No risk detected
- `low` - Low risk level
- `moderate` - Moderate risk level
- `high` - High risk level
- `critical` - Critical risk requiring immediate intervention

## Recommendation Types
- `self_help` - Self-help resources
- `professional_help` - Professional mental health services
- `emergency_contact` - Crisis intervention contacts
- `resource` - Educational resources
- `exercise` - Therapeutic exercises
- `meditation` - Mindfulness practices

## Error Responses
All endpoints return consistent error responses:

```json
{
  "status": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Security Features
- JWT-based authentication
- Role-based access control (Patient, Doctor, Admin)
- Crisis detection and escalation
- Data encryption and secure storage
- Session management
- Risk assessment and monitoring

## Data Storage
All conversation data is stored in MongoDB with the following structure:
- User association via `user_id`
- Session-based conversation grouping
- Message history with timestamps
- Mental health concern tracking
- Risk assessment data
- Recommendation history
- Escalation tracking
