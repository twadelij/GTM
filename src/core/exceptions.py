#!/usr/bin/env python3
"""
Custom exceptions for GTM Game application
"""
from typing import Dict, Any, Optional

class GTMException(Exception):
    """Base exception for GTM application"""
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}

class ValidationError(GTMException):
    """Validation error for user input"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code="VALIDATION_ERROR",
            details=details
        )

class AuthenticationError(GTMException):
    """Authentication related errors"""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR"
        )

class AuthorizationError(GTMException):
    """Authorization related errors"""
    
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR"
        )

class NotFoundError(GTMException):
    """Resource not found error"""
    
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            message=f"{resource} not found",
            status_code=404,
            error_code="NOT_FOUND"
        )

class DatabaseError(GTMException):
    """Database operation errors"""
    
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR"
        )

class ExternalServiceError(GTMException):
    """External service integration errors"""
    
    def __init__(self, service: str, message: str = "External service error"):
        super().__init__(
            message=f"{service}: {message}",
            status_code=502,
            error_code="EXTERNAL_SERVICE_ERROR"
        )

class RateLimitError(GTMException):
    """Rate limiting errors"""
    
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(
            message=message,
            status_code=429,
            error_code="RATE_LIMIT_EXCEEDED"
        )

class PaymentError(GTMException):
    """Payment processing errors"""
    
    def __init__(self, message: str = "Payment processing failed"):
        super().__init__(
            message=message,
            status_code=402,
            error_code="PAYMENT_ERROR"
        )
