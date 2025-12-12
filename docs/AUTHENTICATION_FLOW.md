# Authentication Flow - HttpOnly Cookies

## Login Flow

```ascii
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ POST /api/v1/auth/login
       │ { email, password }
       ▼
┌─────────────────────┐
│ Backend - Login     │
│ Controller          │
└──────┬──────────────┘
       │
       ├─► Verify credentials
       │
       ├─► Set-Cookie: accessToken (httpOnly, Secure, SameSite=strict)
       │   - Path: /api/v1
       │   - Max-Age: 1 hour
       │
       ├─► Set-Cookie: refreshToken (httpOnly, Secure, SameSite=strict)
       │   - Path: /api/v1/auth
       │   - Max-Age: 7 days
       │
       └─► Return { user } in response body
           (accessToken is only sent as an httpOnly cookie)
       │
       ▼
┌─────────────┐
│   Browser   │
│ Stores:     │
│ - httpOnly  │
│   cookies   │
│ - fetches user data via /auth/me │
└─────────────┘
```

## Authenticated API Request

```ascii
┌─────────────┐
│   Browser   │
│ (JavaScript)│
└──────┬──────┘
       │ GET /api/v1/users/profile
       │ (withCredentials: true)
       │
       ├─► Browser automatically attaches:
       │   Cookie: accessToken=<token>
       │
       ▼
┌──────────────────────┐
│ Backend - Auth       │
│ Middleware           │
└──────┬───────────────┘
       │
       ├─► Read token from req.cookies.accessToken
       │
       ├─► Verify JWT with Supabase
       │
       └─► Attach user info to req
       │
       ▼
┌──────────────────────┐
│ Backend - Controller │
│ (with req.user)      │
└──────────────────────┘
```

## Token Refresh Flow (401)

```ascii
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ GET /api/v1/users/profile
       │ Cookie: accessToken=<expired>
       │
       ▼
┌──────────────────────┐
│ Backend               │
│ Returns: 401         │
│ Unauthorized         │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────┐
│ Frontend - Axios    │
│ Interceptor         │
└──────┬──────────────┘
       │
       └─► POST /api/v1/auth/refresh-token
           (withCredentials: true)
           Cookie: refreshToken=<token>
           │
           ▼
┌──────────────────────┐
│ Backend - Refresh    │
│ - Verify refreshToken│
│ - Generate new       │
│   accessToken        │
│ - Set-Cookie:       │
│   accessToken       │
│ - Set-Cookie:       │
│   refreshToken (new)│
└──────┬───────────────┘
       │
       ▼
┌─────────────────────┐
│ Frontend Retries    │
│ Original Request    │
│ with new token      │
└─────────────────────┘
```

## Logout Flow

```ascii
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ POST /api/v1/auth/logout
       │ Cookie: accessToken=<token>
       │
       ▼
┌──────────────────────┐
│ Backend - Logout     │
│ - Verify token       │
│ - Call logout service│
│ - Clear-Cookie:      │
│   accessToken        │
│   (path: /api/v1)    │
│ - Clear-Cookie:      │
│   refreshToken       │
│   (path: /api/v1/auth)
└──────┬───────────────┘
       │
       ▼
┌─────────────┐
│   Browser   │
│ - Cookies   │
│   cleared   │
└─────────────┘
```

## Security Properties

| Property     | Value             | Benefit                                           |
| ------------ | ----------------- | ------------------------------------------------- |
| **httpOnly** | true              | JavaScript cannot access (prevents XSS)           |
| **Secure**   | true (production) | Only sent over HTTPS                              |
| **SameSite** | strict            | Only sent with same-site requests (prevents CSRF) |
| **Path**     | /api/v1           | Limits scope of token usage                       |
| **maxAge**   | 1 hour (access)   | Short expiration limits damage from stolen token  |
| **maxAge**   | 7 days (refresh)  | Allows reasonable session duration                |
