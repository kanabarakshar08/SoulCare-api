# SoulCare API Configuration

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Environment Variables

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/soulcare
DB_NAME=soulcare

# JWT Configuration
JWT_PRIVATE_KEY=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# OpenAI Configuration (Required for AI ChatBot)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=300
OPENAI_TEMPERATURE=0.7
OPENAI_PRESENCE_PENALTY=0.1
OPENAI_FREQUENCY_PENALTY=0.1
OPENAI_TIMEOUT=30000

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Optional Environment Variables

```bash
# Email Configuration (if using email services)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## OpenAI Setup

1. **Get OpenAI API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account or sign in
   - Go to API Keys section
   - Create a new API key
   - Copy the key and add it to your `.env` file

2. **Configure OpenAI Settings:**
   - `OPENAI_API_KEY`: Your OpenAI API key (required)
   - `OPENAI_MODEL`: Model to use (default: gpt-3.5-turbo)
   - `OPENAI_MAX_TOKENS`: Maximum tokens per response (default: 300)
   - `OPENAI_TEMPERATURE`: Response creativity (0.0-2.0, default: 0.7)
   - `OPENAI_PRESENCE_PENALTY`: Penalty for repetition (default: 0.1)
   - `OPENAI_FREQUENCY_PENALTY`: Penalty for frequency (default: 0.1)
   - `OPENAI_TIMEOUT`: Request timeout in milliseconds (default: 30000)

## Database Setup

1. **Install MongoDB:**
   - Download and install MongoDB Community Server
   - Start MongoDB service
   - Create a database named `soulcare`

2. **Configure Connection:**
   - Update `MONGODB_URI` in your `.env` file
   - Default: `mongodb://localhost:27017/soulcare`

## Security Configuration

1. **JWT Secret:**
   - Generate a strong, random secret key
   - Use at least 32 characters
   - Keep it secure and don't commit to version control

2. **CORS:**
   - Configure allowed origins for your frontend
   - Default: `http://localhost:3000`

## AI ChatBot Features

The AI ChatBot uses OpenAI's GPT models to provide:

- **Intelligent Responses**: Context-aware mental health support
- **Crisis Detection**: Automatic identification of high-risk situations
- **Emotional Support**: Empathetic and validating responses
- **Resource Recommendations**: Personalized self-help suggestions
- **Professional Escalation**: Automatic escalation for critical cases

## Model Recommendations

### For Development:
- `gpt-3.5-turbo` (cost-effective, good performance)

### For Production:
- `gpt-4` (better quality, higher cost)
- `gpt-3.5-turbo` (balanced cost/performance)

## Cost Management

- Monitor your OpenAI usage in the dashboard
- Set usage limits to control costs
- Consider implementing caching for repeated queries
- Use appropriate token limits for your use case

## Troubleshooting

### Common Issues:

1. **OpenAI API Key Invalid:**
   - Verify the API key is correct
   - Check if the key has sufficient credits
   - Ensure the key has the necessary permissions

2. **Database Connection Failed:**
   - Verify MongoDB is running
   - Check the connection string
   - Ensure the database exists

3. **JWT Token Issues:**
   - Verify JWT_PRIVATE_KEY is set
   - Check token expiration settings
   - Ensure consistent secret across restarts

### Error Logs:
Check the console output for detailed error messages and stack traces.
