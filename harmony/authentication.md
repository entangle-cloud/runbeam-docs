---
sidebar_position: 7
---

# Authentication

Harmony Proxy supports multiple authentication methods to secure your data integration gateway.

## JWT Authentication

JWT (JSON Web Token) is the recommended authentication method for production deployments.

### RS256 (Recommended)

RS256 uses asymmetric cryptography with public/private key pairs:

```toml
[[middleware]]
type = "jwt-auth"
config = {
  algorithm = "RS256",
  jwks_url = "https://auth.example.com/.well-known/jwks.json",
  issuer = "https://auth.example.com",
  audience = "harmony-api"
}
```

**Benefits**:
- Private key stays on auth server
- Public keys can be distributed
- Supports key rotation
- Industry standard for OAuth/OIDC

### HS256

HS256 uses a shared secret (symmetric):

```toml
[[middleware]]
type = "jwt-auth"
config = {
  algorithm = "HS256",
  secret = "${JWT_SECRET}",  # Use environment variable
  issuer = "harmony",
  audience = "api"
}
```

**Use cases**:
- Development environments
- Internal services with shared secrets
- Simple authentication needs

## Basic Authentication

For simple HTTP Basic authentication:

```toml
[[middleware]]
type = "basic-auth"
config = {
  username = "admin",
  password_hash = "$2b$12$..." # bcrypt hash
}
```

**Note**: Only use with HTTPS in production.

## API Key Authentication

Custom header-based API key authentication:

```toml
[[middleware]]
type = "api-key"
config = {
  header = "X-API-Key",
  keys = [
    "key1_hashed_value",
    "key2_hashed_value"
  ]
}
```

## Runbeam Cloud Integration

When connected to Runbeam Cloud, Harmony uses machine tokens for autonomous authentication:

### Authorization Flow

1. **Initial Setup**: Authenticate via CLI
   ```bash
   runbeam login
   runbeam harmony:authorize -l my-gateway
   ```

2. **Machine Token**: Runbeam issues a 30-day scoped token

3. **Automatic Renewal**: Token is stored securely and used for API calls

4. **Configuration Sync**: Gateway pulls config automatically

### Machine Token Storage

Tokens are stored securely:

- **OS Keyring** (preferred): macOS Keychain, Linux Secret Service, Windows Credential Manager
- **Encrypted Filesystem** (fallback): age X25519 encryption with instance-specific keys

### Environment Variables

```bash
# Pre-provisioned token for headless deployments
export RUNBEAM_MACHINE_TOKEN='{"machine_token":"mt_...", ...}'

# Encryption key for token storage
export RUNBEAM_ENCRYPTION_KEY=AGE-SECRET-KEY-...

# JWT secret for validation
export RUNBEAM_JWT_SECRET=your-secret-here
```

## Token Validation

### JWT Claims

Harmony validates these JWT claims:

- **exp** (Expiry) - Token must not be expired
- **nbf** (Not Before) - Token must be valid
- **iat** (Issued At) - Token issuance time
- **iss** (Issuer) - Must match configured issuer
- **aud** (Audience) - Must match configured audience

### Example JWT Payload

```json
{
  "sub": "user@example.com",
  "iss": "https://auth.example.com",
  "aud": "harmony-api",
  "exp": 1735689600,
  "iat": 1735603200,
  "nbf": 1735603200
}
```

## Multiple Authentication Methods

Chain multiple authentication middleware:

```toml
# Try JWT first, fall back to API key
[[middleware]]
type = "jwt-auth"
config = { algorithm = "RS256", jwks_url = "..." }
optional = true

[[middleware]]
type = "api-key"
config = { header = "X-API-Key", keys = [...] }
```

## Security Best Practices

### Development
- Use HS256 with environment variables for secrets
- Enable debug logging for troubleshooting
- Use short token expiry times

### Production
- **Always use RS256** with JWKS rotation
- **Never commit secrets** to version control
- **Use HTTPS** for all endpoints
- **Store tokens securely** in OS keyring or encrypted storage
- **Monitor token expiry** and rotate before 30 days
- **Use separate keys** for different environments

### Encryption Key Generation

```bash
# Generate encryption key (Linux/macOS)
age-keygen | grep AGE-SECRET-KEY | base64 -w 0

# Store in environment
export RUNBEAM_ENCRYPTION_KEY=$(age-keygen | grep AGE-SECRET-KEY | base64 -w 0)
```

## Troubleshooting

### JWT Validation Fails

**Symptoms**: "Invalid signature" or "Token expired"

**Solutions**:
- Check system clock is synchronized
- Verify JWKS endpoint is accessible
- Ensure token hasn't expired
- Check issuer and audience claims match

### Machine Token Expired

**Symptoms**: Gateway can't connect to Runbeam Cloud

**Solutions**:
- Check expiry: `runbeam harmony:info -l my-gateway`
- Re-authorize: `runbeam harmony:authorize -l my-gateway`
- Set up monitoring alert at 25 days

### Storage Backend Issues

**Symptoms**: "Failed to save token" or "Keyring unavailable"

**Solutions**:
- Verify OS keyring service is running
- Check file permissions on `~/.runbeam/`
- Set `RUNBEAM_ENCRYPTION_KEY` explicitly
- Check logs: `RUST_LOG=debug harmony-proxy`

## Next Steps

- [Deploy to production →](./deployment)
- [Learn about authentication concepts →](/docs/concepts/authentication)
