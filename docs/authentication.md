# Authentication System Documentation

## Overview

This fitness app backend provides a comprehensive authentication system with secure user registration, login, and session management. The system implements industry best practices for security, validation, and error handling.

## Features

### ✅ Core Authentication

- **User Registration** (`POST /api/auth/signup`)
- **User Login** (`POST /api/auth/signin`)
- **JWT Token Management** (Access & Refresh tokens)
- **Secure Password Hashing** (bcrypt with configurable rounds)
- **Email Validation** with format and domain checking
- **Password Strength Validation** with multiple requirements

### ✅ Security Features

- **Rate Limiting** (configurable per endpoint)
- **Input Validation** (express-validator with custom rules)
- **XSS Protection** (helmet.js security headers)
- **CORS Configuration** (React Native friendly)
- **Error Handling** (comprehensive error responses)
- **Token Security** (JWT with issuer/audience validation)

### ✅ Advanced Features

- **Account Lockout** protection against brute force
- **Secure Token Generation** with unique IDs
- **Environment-based Configuration**
- **Comprehensive Logging**
- **Health Check Endpoints**

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. User Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### 2. User Signin

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### 3. Refresh Token

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Validation Rules

### Password Requirements

- **Minimum Length:** 8 characters
- **Maximum Length:** 128 characters
- **Must Include:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%\*?&)
- **Forbidden:** Common passwords (password, 123456, etc.)

### Email Requirements

- **Valid Format:** RFC 5322 compliant
- **Maximum Length:** 254 characters
- **Domain Validation:** Configurable allowed/blocked domains
- **Normalization:** Automatic lowercase conversion

## Security Configuration

### Rate Limiting

```javascript
// Authentication endpoints
auth: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
}

// General API endpoints
general: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
}

// Signup endpoint
signup: {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 signups per hour per IP
}
```

### JWT Configuration

```javascript
{
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'fitness-app',
  audience: 'fitness-app-users',
  algorithm: 'HS256'
}
```

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {} // Optional additional information
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `DUPLICATE_ENTRY` - Email already exists
- `INVALID_TOKEN` - JWT token is invalid
- `TOKEN_EXPIRED` - JWT token has expired
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `EMAIL_NOT_VERIFIED` - Account not verified
- `INVALID_CREDENTIALS` - Wrong email/password

## Environment Variables

### Required Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/fitness-app

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Security
BCRYPT_ROUNDS=12
```

### Optional Variables

```bash
# CORS
ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

## Usage Examples

### Frontend Integration (React Native/JavaScript)

#### Signup

```javascript
const signup = async (email, password, confirmPassword) => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token securely
      await AsyncStorage.setItem('authToken', data.token);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};
```

#### Signin

```javascript
const signin = async (email, password) => {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token securely
      await AsyncStorage.setItem('authToken', data.token);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
};
```

#### Authenticated Requests

```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = await AsyncStorage.getItem('authToken');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
```

## Testing

### Manual Testing with cURL

#### Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'
```

#### Signin

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### Protected Route (with token)

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Security Best Practices Implemented

1. **Password Security**

   - Strong password requirements
   - Secure hashing with bcrypt
   - Configurable salt rounds

2. **Token Security**

   - Short-lived access tokens (15 minutes)
   - Longer refresh tokens (7 days)
   - Token rotation support
   - Unique token IDs (JTI)

3. **Input Validation**

   - Server-side validation for all inputs
   - XSS protection
   - SQL injection prevention
   - Input sanitization

4. **Rate Limiting**

   - Per-endpoint rate limits
   - IP-based throttling
   - Progressive delays

5. **Error Handling**
   - No sensitive information in errors
   - Consistent error format
   - Proper HTTP status codes

## Monitoring and Logging

The system includes comprehensive logging for:

- Authentication attempts (success/failure)
- Rate limit violations
- Token generation and validation
- Security events
- API usage patterns

## Future Enhancements

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Facebook)
- [ ] Session management dashboard
- [ ] Advanced security monitoring
- [ ] Account recovery mechanisms

## Support

For questions or issues with the authentication system, please check the error logs and ensure all environment variables are properly configured.
