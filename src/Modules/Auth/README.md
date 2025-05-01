# Authentication Module

This module handles user authentication using a secure OTP (One-Time Password) based system. It supports both email and phone number authentication methods.

## Features

- Email/Phone number based authentication
- OTP verification
- Automatic user registration
- Secure JWT token generation
- HTTP-only cookie based session management

## Workflow

### 1. Login/Registration Flow

1. User submits their email or phone number
2. System validates the input format
3. If user exists:
   - Checks if user is banned
   - Checks for existing unexpired OTP
   - Generates new OTP
   - Sends OTP via email
4. If user doesn't exist:
   - Creates new user account
   - Generates OTP
   - Sends OTP via email

### 2. OTP Verification Flow

1. User submits the received OTP
2. System validates the OTP:
   - Checks if OTP exists
   - Verifies OTP expiration
   - Validates associated user
   - Checks user status
3. If valid:
   - Generates JWT token
   - Sets HTTP-only cookie
   - Returns success response
4. If invalid:
   - Returns appropriate error message

## API Endpoints

### POST /auth/login
- **Purpose**: Initiate login/registration process
- **Input**: Email or phone number
- **Response**: OTP sent confirmation

### POST /auth/verify-otp
- **Purpose**: Verify OTP and complete authentication
- **Input**: 6-digit OTP code
- **Response**: Authentication success/failure

## Security Features

- OTP expiration (2 minutes)
- HTTP-only cookies for token storage
- Secure JWT token generation
- IP address tracking
- User status validation

## Error Handling

The module handles various error scenarios:
- Invalid input format
- Expired OTP
- Invalid OTP
- Banned users
- Database errors

## Testing

The module includes comprehensive unit tests covering:
- Input validation
- OTP generation
- Token creation
- Login flow
- OTP verification
- Error scenarios

To run tests:
```bash
npm test src/Modules/Auth/Auth.test.js
```

## Dependencies

- Express.js
- PostgreSQL
- JWT
- Email Queue Service
- HTTP Errors

## Environment Variables

Required environment variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment mode (development/production)

## Best Practices

1. Always use HTTPS in production
2. Keep JWT_SECRET secure and rotate regularly
3. Monitor failed login attempts
4. Implement rate limiting
5. Keep dependencies updated
6. Regular security audits 