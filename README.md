# SoulCare API - Mental Health Platform

A comprehensive REST API for a mental health and wellness platform with AI-powered chatbot support.

## 🚀 Features

### Core Features
- **User Authentication** - JWT-based authentication with role-based access
- **AI ChatBot** - OpenAI-powered mental health support chatbot
- **Mental Health Analysis** - Automatic concern detection and risk assessment
- **Crisis Intervention** - Real-time crisis detection and escalation
- **Professional Escalation** - Automatic doctor assignment for high-risk cases
- **Data Storage** - MongoDB integration with comprehensive conversation tracking

### AI ChatBot Capabilities
- **Intelligent Responses** - Context-aware mental health support using OpenAI GPT
- **Crisis Detection** - Automatic identification of suicide risk and self-harm
- **Emotional Support** - Empathetic and validating responses
- **Resource Recommendations** - Personalized self-help suggestions
- **Professional Escalation** - Automatic escalation to doctors for critical cases

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-3.5-turbo / GPT-4
- **Authentication**: JWT tokens
- **Security**: Role-based access control, data encryption

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- OpenAI API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SoulCare-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```bash
   # Required
   MONGODB_URI=mongodb://localhost:27017/soulcare
   JWT_PRIVATE_KEY=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 🤖 AI ChatBot Setup

### OpenAI Configuration

1. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account and generate an API key
   - Add the key to your `.env` file

2. **Configure AI Settings**
   ```bash
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_MAX_TOKENS=300
   OPENAI_TEMPERATURE=0.7
   ```

### Testing AI Integration

Run the test script to verify OpenAI integration:
```bash
node App/Services/AI/test-openai.js
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `POST /api/auth/user-verification` - Email verification

### ChatBot Endpoints
- `POST /api/chatbot/send-message` - Send message to AI
- `GET /api/chatbot/conversation/:session_id` - Get conversation history
- `GET /api/chatbot/sessions` - Get user sessions
- `POST /api/chatbot/start-session` - Start new conversation
- `POST /api/chatbot/end-session/:session_id` - End conversation
- `GET /api/chatbot/insights` - Get personal mental health insights

### Doctor/Admin Endpoints
- `GET /api/chatbot/escalated` - View escalated conversations
- `POST /api/chatbot/assign/:session_id` - Assign to doctor
- `GET /api/chatbot/analytics` - Platform analytics

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Patient, Doctor, Admin roles
- **Crisis Detection** - Automatic risk assessment
- **Data Privacy** - Secure MongoDB storage
- **Rate Limiting** - API request throttling

## 🧠 Mental Health Features

### Concern Types
- Anxiety, Depression, Stress
- Sleep issues, Mood fluctuations
- Social anxiety, Trauma
- Crisis situations

### Risk Assessment
- None, Low, Moderate, High, Critical
- Suicide risk detection
- Self-harm risk assessment
- Professional escalation

### Recommendations
- Self-help resources
- Professional help guidance
- Emergency contacts
- Therapeutic exercises
- Mindfulness practices

## 📊 Data Models

### ChatBot Model
- User association
- Session management
- Message history
- Mental health concerns
- Risk assessments
- Recommendations
- Escalation tracking

## 🚨 Crisis Intervention

The system automatically detects crisis situations and:
1. Provides immediate crisis response
2. Escalates to professional staff
3. Offers emergency resources
4. Tracks risk levels

## 🔧 Configuration

See `App/config/README.md` for detailed configuration options.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the development team.