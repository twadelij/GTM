# Troubleshooting Guide

## Common Issues

### 1. Content Security Policy (CSP) Errors

#### Symptoms
- Console warnings about blocked resources
- Images not loading
- Scripts not executing

#### Solutions
1. Check CSP header in index.html
2. Verify all domains are properly whitelisted
3. Avoid inline scripts and eval()
4. Use proper image sources

### 2. Timer Issues

#### Symptoms
- Timer not starting
- Inconsistent countdown
- Multiple timers running

#### Solutions
1. Clear existing intervals
2. Use proper scoping for timer functions
3. Implement cleanup on state changes

### 3. Image Loading Problems

#### Symptoms
- Blank images
- Loading failures
- Slow image transitions

#### Solutions
1. Implement proper error handling
2. Add loading states
3. Use image preloading
4. Check TMDb API access

### 4. Authentication Issues

#### Symptoms
- Login failures
- Session problems
- API access denied

#### Solutions
1. Check server logs
2. Verify API endpoints
3. Test user credentials
4. Check network requests

## Debugging Steps

### Frontend Debugging
1. Open browser console (F12)
2. Check for error messages
3. Verify network requests
4. Test state transitions

### Backend Debugging
1. Check server logs
2. Test API endpoints
3. Verify file permissions
4. Check configuration

### Network Debugging
```bash
# Test server connection
curl -v http://localhost:8888

# Check API endpoint
curl -v http://localhost:8888/api/check-login

# Test authentication
curl -X POST http://localhost:8888/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser1"}'
```

## Error Messages

### CSP Errors
```javascript
// Common CSP error
Refused to load the image 'https://image.tmdb.org/...' because it violates CSP

// Solution
Add to CSP: img-src 'self' https://image.tmdb.org
```

### Timer Errors
```javascript
// Multiple timer error
clearInterval(currentTimerInterval);
currentTimerInterval = null;
```

### API Errors
```javascript
// API access error
fetch(): Failed to fetch
// Solution: Check API key and endpoints
```

## Quick Fixes

### Reset Game State
1. Clear localStorage
2. Refresh page
3. Restart server

### Clear Cache
1. Browser cache
2. Local storage
3. Cookies

### Server Reset
```bash
# Kill existing server
lsof -i :8888 | grep LISTEN | awk '{print $2}' | xargs kill

# Start new server
python3 server.py
```

## Prevention

### Best Practices
1. Regular testing
2. Error logging
3. State validation
4. Clean error handling

### Monitoring
1. Server logs
2. Browser console
3. Network requests
4. User feedback
