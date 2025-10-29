# Gmail OAuth2 Authentication Setup Process

## Overview
Dit document beschrijft het setup proces voor Gmail OAuth2 authenticatie in de GTM applicatie.

## Vereisten
- Google Cloud Project
- OAuth2 consent screen
- Client ID en Client Secret

## Stap 1: Google Cloud Project Setup

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project of selecteer bestaand project
3. Enable "Google+ API" en "Google Identity Toolkit API"

## Stap 2: OAuth2 Consent Screen Configureren

1. Navigeer naar "APIs & Services" > "OAuth consent screen"
2. Kies "External" (voor productie) of "Internal" (voor testing)
3. Vul app informatie in:
   - App name: Guess The Movie Game
   - User support email: jouw-email@domein.com
   - Developer contact: jouw-email@domein.com

## Stap 3: Scopes Toevoegen

Voeg de volgende scopes toe:
- `../auth/userinfo.email`
- `../auth/userinfo.profile`
- `openid`

## Stap 4: Credentials Maken

1. Navigeer naar "APIs & Services" > "Credentials"
2. Klik "Create Credentials" > "OAuth client ID"
3. Selecteer "Web application"
4. Voeg Authorized redirect URIs toe:
   - Development: `http://localhost:8888/auth/google/callback`
   - Production: `https://jouw-domein.com/auth/google/callback`

## Stap 5: Environment Variabelen Configureren

Voeg toe aan `.env` bestand:

```bash
# Gmail OAuth2 Configuration
GOOGLE_CLIENT_ID=jouw-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=jouw-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8888/auth/google/callback
JWT_SECRET=jouw-super-secret-jwt-key-here
```

## Stap 6: Applicatie Herstarten

1. Stop de applicatie
2. Start opnieuw met nieuwe environment variabelen
3. Test authenticatie flow

## Test Process

1. Navigeer naar `http://localhost:8888/api/v1/auth/google/login`
2. Volg Google authenticatie stappen
3. Verifieer redirect naar applicatie
4. Check user profiel via `/api/v1/auth/me`

## Production Consideraties

- Gebruik HTTPS URLs
- Configureer domein verification
- Zet security measures aan (rate limiting, etc.)
- Monitor authenticatie logs

## Troubleshooting

### Common Errors
- `redirect_uri_mismatch`: Check redirect URI in Google Console
- `invalid_client`: Verify client ID en secret
- `access_denied`: User heeft authenticatie geweigerd

### Debug Steps
1. Check environment variabelen
2. Verify Google Console settings
3. Check application logs
4. Test met incognito browser
