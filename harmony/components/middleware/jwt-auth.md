---
sidebar_label: JWT Auth
---

# JWT Auth

Verifies `Authorization: Bearer <token>` using cryptographic signature checks and claims validation.

## Supported modes

- **RS256** (default, recommended) - Verify with RSA public key
- **HS256** (explicit, dev/test only) - Verify with symmetric secret

## RS256 configuration (production)

```toml
[middleware.jwt_auth]
type = "jwt_auth"
public_key_path = "/etc/harmony/jwt_public.pem"
issuer = "https://auth.example.com/"
audience = "harmony"
leeway_secs = 60
```

## HS256 configuration (development)

```toml
[middleware.jwt_auth]
type = "jwt_auth"
use_hs256 = true
hs256_secret = "your-strong-secret"
issuer = "https://auth.example.com/"
audience = "harmony"
leeway_secs = 60
```

## Options

- `public_key_path` (string, required for RS256) - Path to RSA public key (PEM)
- `use_hs256` (bool, default: false) - Enable HS256 mode explicitly
- `hs256_secret` (string, required when `use_hs256 = true`) - Shared secret
- `issuer` (string, optional) - Expected `iss` claim
- `audience` (string, optional) - Expected `aud` claim
- `leeway_secs` (integer, optional) - Clock skew allowance for time-based claims

## Behavior

- Strict algorithm enforcement (no downgrades)
- Validates `exp`, `nbf`, and `iat` with optional leeway
- Validates `iss` and `aud` when configured
- Startup safety: panics if neither RS256 public key nor explicit HS256 is configured

## Best practices

- Place JWT middleware early in your pipeline
- Always use RS256 in production
- Never commit secrets to version control

## Error handling

- Authentication failures (missing/invalid/expired tokens) return HTTP `401`
- Internal errors (key parsing, config issues) return HTTP `500`

## Related

- [← Middleware](../middleware.md)
