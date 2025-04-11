# GigGatek Session Management

This document describes the session management system implemented in the GigGatek platform.

## Overview

The session management system ensures that users have a seamless experience across page refreshes, browser tabs, and devices. It handles authentication tokens, user preferences, and application state persistence.

## Key Components

### SessionManager

The `SessionManager` class is the core component responsible for managing user sessions:

```javascript
class SessionManager {
    constructor() {
        // Session state
        this.sessionId = localStorage.getItem('session_id');
        this.sessionStartTime = parseInt(localStorage.getItem('session_start_time') || '0');
        this.lastActivityTime = parseInt(localStorage.getItem('last_activity_time') || '0');
        this.deviceId = this.getOrCreateDeviceId();
        
        // Session configuration
        this.config = {
            // Session timeout in milliseconds (30 minutes)
            sessionTimeout: 30 * 60 * 1000,
            // Activity tracking interval in milliseconds (1 minute)
            activityInterval: 60 * 1000,
            // Session sync interval in milliseconds (5 minutes)
            syncInterval: 5 * 60 * 1000,
            // Whether to persist session across browser restarts
            persistSession: true,
            // Whether to track user activity
            trackActivity: true
        };
        
        // Initialize
        this.init();
    }
    
    // ... methods for session management
}
```

### SessionRecoveryService

The `SessionRecoveryService` handles recovery of sessions after crashes or unexpected closures:

```javascript
class SessionRecoveryService {
    constructor() {
        // Recovery state
        this.recoveryAttempted = false;
        this.recoverySuccessful = false;
        this.recoveryData = null;
        
        // Initialize
        this.init();
    }
    
    // ... methods for session recovery
}
```

### MobileSessionHandler

The `MobileSessionHandler` optimizes sessions for mobile devices:

```javascript
class MobileSessionHandler {
    constructor() {
        // Mobile state
        this.isMobile = this.checkIfMobile();
        this.isOnline = navigator.onLine;
        this.isLowBandwidth = false;
        this.batteryLevel = null;
        
        // Initialize
        this.init();
    }
    
    // ... methods for mobile session handling
}
```

### Auth Class

The `Auth` class handles authentication and token management:

```javascript
class Auth {
    constructor() {
        // Authentication state
        this.token = localStorage.getItem('auth_token');
        this.tokenExpiry = localStorage.getItem('auth_token_expiry');
        this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
        
        // Token refresh state
        this.refreshTimer = null;
        this.refreshing = false;
        this.refreshRetryCount = 0;
        this.lastRefreshTime = parseInt(localStorage.getItem('auth_last_refresh') || '0');
        
        // Initialize
        this.init();
    }
    
    // ... methods for authentication and token management
}
```

## Features

### Session Persistence

Sessions are persisted across page refreshes and browser restarts using localStorage:

- Session ID
- Session start time
- Last activity time
- Authentication token
- User data

### Cross-Device Synchronization

Sessions can be synchronized across devices by:

1. Storing session data on the server
2. Retrieving session data when a user logs in on a new device
3. Merging local and remote session data

### Session Recovery

The system can recover sessions after crashes or unexpected closures by:

1. Saving session state before page unload
2. Restoring form data, scroll position, and page state on page load
3. Recovering authentication state

### Token Refresh

Authentication tokens are automatically refreshed before they expire:

1. Token expiry is tracked
2. Tokens are refreshed at 75% of their lifetime
3. Failed refreshes are retried with exponential backoff
4. Users are logged out if token refresh fails after multiple attempts

### Multi-Tab Support

The system supports multiple tabs by:

1. Using localStorage events to synchronize state across tabs
2. Preventing race conditions during token refresh
3. Ensuring consistent authentication state

### Mobile Optimization

Mobile sessions are optimized by:

1. Detecting connection type and quality
2. Reducing data usage on low-bandwidth connections
3. Monitoring battery level and optimizing for low battery
4. Supporting offline mode

## Configuration

The session management system can be configured through the `config` object in the `SessionManager` class:

```javascript
this.config = {
    // Session timeout in milliseconds (30 minutes)
    sessionTimeout: 30 * 60 * 1000,
    // Activity tracking interval in milliseconds (1 minute)
    activityInterval: 60 * 1000,
    // Session sync interval in milliseconds (5 minutes)
    syncInterval: 5 * 60 * 1000,
    // Whether to persist session across browser restarts
    persistSession: true,
    // Whether to track user activity
    trackActivity: true
};
```

## API

### SessionManager API

- `createSession()`: Creates a new session
- `isSessionExpired()`: Checks if the session is expired
- `updateActivity()`: Updates the last activity time
- `syncSession()`: Synchronizes the session with the server
- `getSessionData()`: Gets the session data
- `getSessionDuration()`: Gets the session duration
- `getTimeUntilExpiry()`: Gets the time until session expiry

### Auth API

- `login(email, password)`: Logs in a user
- `logout()`: Logs out a user
- `refreshToken()`: Refreshes the authentication token
- `isLoggedIn()`: Checks if a user is logged in
- `getUserData()`: Gets the user data
- `getToken()`: Gets the authentication token
- `getTokenExpiry()`: Gets the token expiry time
- `isTokenExpiringSoon(thresholdMs)`: Checks if the token will expire soon
- `ensureValidToken()`: Ensures the token is valid and refreshed if needed

## Events

The session management system dispatches the following events:

- `session:created`: When a new session is created
- `session:expired`: When a session expires
- `session:online`: When the device goes online
- `session:offline`: When the device goes offline
- `session:visible`: When the page becomes visible
- `session:hidden`: When the page becomes hidden
- `session:recovered`: When a session is recovered
- `auth:login`: When a user logs in
- `auth:logout`: When a user logs out
- `auth:token-refreshed`: When a token is refreshed
- `auth:user-updated`: When user data is updated

## Best Practices

1. **Listen for Events**: Use event listeners to react to session changes
2. **Check Authentication**: Always check if a user is logged in before accessing protected resources
3. **Handle Offline Mode**: Provide fallback functionality when offline
4. **Secure Tokens**: Never expose authentication tokens in URLs or logs
5. **Respect User Privacy**: Only store necessary data in the session
6. **Test Edge Cases**: Test session recovery, token refresh failures, and offline mode

## Troubleshooting

### Common Issues

1. **Session Not Persisting**: Check if localStorage is available and not full
2. **Token Refresh Failing**: Check network connectivity and server status
3. **Session Recovery Not Working**: Check if the recovery data is valid
4. **Multi-Tab Issues**: Check for race conditions in token refresh

### Debugging

The system includes debugging tools:

1. **AuthDebugPanel**: A UI panel for monitoring authentication state
2. **Console Logging**: Detailed logs for session events
3. **SessionRecoveryService.getRecoveryStatus()**: Gets the recovery status
4. **MobileSessionHandler.getMobileStatus()**: Gets the mobile status

## Future Improvements

1. **Refresh Token Rotation**: Implement refresh token rotation for better security
2. **Biometric Authentication**: Add support for biometric authentication on mobile devices
3. **Offline Data Synchronization**: Improve offline data synchronization
4. **Cross-Device Real-Time Synchronization**: Implement WebSocket-based real-time synchronization
5. **Enhanced Privacy Controls**: Add more granular privacy controls for session data
