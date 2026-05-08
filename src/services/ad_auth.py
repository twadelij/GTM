#!/usr/bin/env python3
"""
Active Directory / LDAP Authentication Service
For CBS Active Directory integration
"""
import ldap
from typing import Optional, Dict, Any
import logging

from src.config.config import config

logger = logging.getLogger(__name__)


class ADAuthService:
    """Active Directory authentication service"""
    
    def __init__(self):
        self.ad_server = getattr(config, 'AD_SERVER', 'ldap://cbsp.nl')
        self.base_dn = getattr(config, 'AD_BASE_DN', 'dc=cbsp,dc=nl')
        self.bind_user = getattr(config, 'AD_BIND_USER', 'sa_ansible')
        self.bind_password = getattr(config, 'AD_BIND_PASSWORD', '')
        
        if not self.bind_password:
            logger.warning("AD_BIND_PASSWORD not set - AD auth will not work")
    
    def authenticate(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user against Active Directory
        
        Args:
            username: CBS username (e.g., admtadj)
            password: User password
            
        Returns:
            Dict with user info if successful, None if failed
        """
        try:
            # Connect to AD server
            conn = ldap.initialize(self.ad_server)
            conn.protocol_version = ldap.VERSION3
            conn.set_option(ldap.OPT_REFERRALS, 0)
            
            # First bind with service account to search for user
            try:
                conn.simple_bind_s(self.bind_user, self.bind_password)
            except ldap.INVALID_CREDENTIALS:
                logger.error("AD service account credentials invalid")
                return None
            except ldap.SERVER_DOWN:
                logger.error(f"AD server unreachable: {self.ad_server}")
                return None
            
            # Search for user DN
            search_filter = f"(sAMAccountName={username})"
            result = conn.search_s(
                self.base_dn,
                ldap.SCOPE_SUBTREE,
                search_filter,
                ['sAMAccountName', 'displayName', 'mail', 'givenName', 'sn']
            )
            
            if not result:
                logger.warning(f"User not found in AD: {username}")
                conn.unbind()
                return None
            
            user_dn = result[0][0]
            user_attrs = result[0][1]
            
            # Now bind with user credentials to verify password
            try:
                conn.simple_bind_s(user_dn, password)
            except ldap.INVALID_CREDENTIALS:
                logger.warning(f"Invalid password for user: {username}")
                conn.unbind()
                return None
            
            # Authentication successful
            user_info = {
                'username': username,
                'dn': user_dn,
                'display_name': user_attrs.get('displayName', [b''])[0].decode('utf-8'),
                'email': user_attrs.get('mail', [b''])[0].decode('utf-8'),
                'first_name': user_attrs.get('givenName', [b''])[0].decode('utf-8'),
                'last_name': user_attrs.get('sn', [b''])[0].decode('utf-8'),
            }
            
            conn.unbind()
            logger.info(f"User authenticated successfully: {username}")
            return user_info
            
        except Exception as e:
            logger.error(f"AD authentication error: {str(e)}")
            return None
    
    def get_user_info(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Get user info from AD without authentication (for admin purposes)
        
        Args:
            username: CBS username
            
        Returns:
            Dict with user info if found, None if not found
        """
        try:
            conn = ldap.initialize(self.ad_server)
            conn.protocol_version = ldap.VERSION3
            conn.set_option(ldap.OPT_REFERRALS, 0)
            
            # Bind with service account
            conn.simple_bind_s(self.bind_user, self.bind_password)
            
            # Search for user
            search_filter = f"(sAMAccountName={username})"
            result = conn.search_s(
                self.base_dn,
                ldap.SCOPE_SUBTREE,
                search_filter,
                ['sAMAccountName', 'displayName', 'mail', 'givenName', 'sn']
            )
            
            if not result:
                conn.unbind()
                return None
            
            user_attrs = result[0][1]
            user_info = {
                'username': username,
                'display_name': user_attrs.get('displayName', [b''])[0].decode('utf-8'),
                'email': user_attrs.get('mail', [b''])[0].decode('utf-8'),
                'first_name': user_attrs.get('givenName', [b''])[0].decode('utf-8'),
                'last_name': user_attrs.get('sn', [b''])[0].decode('utf-8'),
            }
            
            conn.unbind()
            return user_info
            
        except Exception as e:
            logger.error(f"AD user lookup error: {str(e)}")
            return None


# Singleton instance
ad_auth_service = ADAuthService()
