---
sidebar_position: 1
---

# Authentication

Understanding authentication in the Runbeam ecosystem.

## Overview

The Runbeam platform uses a multi-layered authentication approach that balances security, usability, and autonomous operation. This guide explains how authentication works across Runbeam Cloud, Harmony Proxy, the CLI, and the SDK.

## Authentication Layers

### User Authentication (OAuth/OIDC)

**Purpose**: Human users accessing Runbeam Cloud

**How it works**:
1. User logs in via OAuth/OIDC provider
2. Runbeam issues a JWT token (RS256 signed)
3. Token contains user identity and permissions
4. Token is valid for a limited time (typically 24 hours)

**Used by**:
- Web UI access to Runbeam Cloud
- CLI login (`runbeam login`)
- SDK applications during initial setup

### API Tokens (Laravel Sanctum)

**Purpose**: Programmatic access to Runbeam Cloud API

**How it works**:
1. User creates API token in Runbeam Cloud
2. Token format: `{id}|{plaintext_token}`
3. Server validates token on each request
4. Tokens can have granular permissions

**Used by**:
- SDK applications (alternative to JWT)
- Custom integrations
- CI/CD pipelines

### Machine Tokens

**Purpose**: Autonomous operation of Harmony gateways

**How it works**:
1. User (via CLI or SDK) requests gateway authorization
2. Runbeam Cloud issues machine-scoped token
3. Token is valid for 30 days
4. Token is stored encrypted on the gateway
5. Gateway uses token for autonomous API access

**Used by**:
- Harmony Proxy connecting to Runbeam Cloud
- Automatic configuration updates
- Gateway health reporting

## JWT Token Validation

JWT tokens in Runbeam use RS256 (asymmetric cryptography) for security:

### Structure

```
eyJhbGci...  (Header - algorithm, key ID)
eyJzdWI...  (Payload - user info, expiry)
SflKxwR... (Signature - cryptographic proof)
```

### Validation Process

1. **Extract Key ID** from JWT header
2. **Fetch Public Key** from JWKS endpoint (cached 1 hour)
3. **Verify Signature** using RS256 algorithm
4. **Check Expiry** (exp), Not Before (nbf), Issued At (iat)
5. **Validate Issuer** and Audience claims

### Why RS256?

- **Asymmetric**: Private key stays on server, public keys distributed
- **Key Rotation**: Multiple keys can be active (via `kid`)
- **Offline Validation**: Clients verify locally without server calls
- **Standards Compliant**: Industry standard for OAuth/OIDC

## Authorization Flow

### Gateway Authorization

The most common authorization flow - connecting Harmony to Runbeam Cloud:

```
Authorization Flow
├── 1. User Login
│   └── User runs: runbeam login
│
├── 2. CLI to Harmony
│   └── CLI sends user token to Harmony
│
├── 3. Harmony to Cloud
│   └── Harmony validates JWT, requests machine token
│
├── 4. Token Exchange
│   └── Runbeam Cloud issues 30-day machine token
│
└── 5. Secure Storage
    └── Harmony encrypts and stores machine token
    └── Gateway uses token for API access
```

**Step-by-step**:

1. **User Login**: User runs `runbeam login`, authenticates via browser
2. **CLI to Harmony**: User runs `runbeam harmony:authorize`, CLI sends user token to Harmony
3. **Harmony to Cloud**: Harmony validates user JWT, requests machine token from Runbeam Cloud
4. **Token Exchange**: Runbeam Cloud issues 30-day machine token
5. **Secure Storage**: Harmony encrypts and stores machine token
6. **Autonomous Operation**: Harmony uses machine token for ongoing API access

### Pre-Provisioned Tokens

For headless deployments where interactive authorization isn't possible:

```bash
# Export machine token (obtained from Runbeam Cloud)
export RUNBEAM_MACHINE_TOKEN='{
  "machine_token":"mt_abc...",
  "expires_at":"2025-12-31T23:59:59Z",
  "gateway_id":"gw-123",
  "gateway_code":"prod-gw",
  "abilities":[],
  "issued_at":"2025-01-01T00:00:00Z"
}'

# Optionally set encryption key for persistence
export RUNBEAM_ENCRYPTION_KEY=AGE-SECRET-KEY-...

# Start Harmony - token is used automatically
./harmony-proxy --config config.toml
```

## Token Storage

### Security Requirements

Tokens must never be stored in plaintext on disk. The Runbeam ecosystem uses:

**Encrypted Filesystem**
- age X25519 encryption
- Restrictive file permissions (0600 on Unix)
- Instance-specific encryption keys

### Encryption Key Management

For encrypted filesystem storage, keys are sourced from:

**Priority order**:
1. CLI-provided key (via `/admin/authorize` request)
2. `RUNBEAM_ENCRYPTION_KEY` environment variable
3. Auto-generated key at `~/.runbeam/<instance_id>/encryption.key`

**Production recommendation**: Use environment variable for consistency:

```bash
# Generate key (Linux/macOS)
export RUNBEAM_ENCRYPTION_KEY=$(age-keygen | grep AGE-SECRET-KEY | base64 -w 0)

# Store in secret manager (example with AWS Secrets Manager)
aws secretsmanager create-secret \
  --name harmony-encryption-key \
  --secret-string "$RUNBEAM_ENCRYPTION_KEY"
```

## Security Best Practices

### For Development

- Use `runbeam login` for interactive authentication
- Rotate tokens regularly

### For Production

- Use `RUNBEAM_ENCRYPTION_KEY` environment variable
- Store encryption keys in secret manager (Vault, AWS, Azure)
- Enable `RUNBEAM_MACHINE_TOKEN` for headless deployments
- Monitor token expiry and renew before 30 days
- Use separate gateways for different environments

### Token Rotation

Machine tokens expire after 30 days. To rotate:

```bash
# Re-authorize before expiry
runbeam harmony:authorize -l my-gateway

# Or programmatically via SDK
let response = client.authorize_gateway(
    user_token,
    gateway_id,
    None,
    None
).await?;
```

## Troubleshooting

### JWT Validation Fails

**Symptoms**: "Invalid signature" or "Token expired"

**Solutions**:
- Check system clock is synchronized
- Verify JWKS endpoint is accessible
- Ensure token hasn't expired
- Check `RUNBEAM_JWKS_TTL` if using custom cache duration

For authorization and token management troubleshooting, see the [Authorizing Gateways →](/runbeam/runbeam-authorization#troubleshooting) guide.

## Next Steps

- [Runbeam CLI →](/cli) - Using the CLI
- [Runbeam SDK →](/sdk) - Integrating with the SDK
