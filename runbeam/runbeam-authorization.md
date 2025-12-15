---
id: runbeam-authorization
sidebar_position: 2
---

# Authorizing Gateways

Authorize Harmony to communicate with Runbeam Cloud using a machine-scoped token.

## Overview

When connected to Runbeam Cloud, Harmony can:
- Automatically pull configuration updates
- Report gateway health and status
- Store configuration in Runbeam Cloud

Authorization exchanges your user credentials for a **machine token** (30-day expiry) that the gateway stores securely and uses for ongoing autonomous access.

## Prerequisites

Before authorizing, ensure:

1. Your Harmony config enables Runbeam integration:
   ```toml
   [runbeam]
   enabled = true
   ```

2. You have access to the Harmony Management API (default: `http://localhost:9090`)

## CLI Method (Interactive)

Use the `runbeam` CLI to authorize a running Harmony instance. For detailed instructions, see the [Authorization Guide](/cli/authorization).

## Out-of-Band Token Generation (CI/CD)

For CI/CD pipelines and containerized deployments where browser-based authentication isn't possible or a Harmony instance isn't running, use `token:get` to obtain a machine token directly:

```bash
# Get a machine token for a gateway code (with full output)
runbeam token:get -g my-gateway-code

# For scripting, use --raw to output only the token
runbeam token:get -g my-gateway-code --raw

# Capture as environment variable
export RUNBEAM_MACHINE_TOKEN=$(runbeam token:get -g my-gateway-code --raw)
```

This command:
- Does not require a registered Harmony instance
- Does not attempt to send the token to a Harmony proxy
- Creates the gateway if it doesn't exist
- Outputs the token for capture and injection as an environment variable

### Alternative: API Token Method

You can also create a Sanctum API token in the Runbeam Cloud UI and call the API directly:

```bash
curl -X POST https://your-runbeam-instance/api/harmony/authorize \
  -H "Authorization: Bearer <sanctum_api_token>" \
  -H "Content-Type: application/json" \
  -d '{"gateway_code": "my-gateway-code"}'
```

The response includes the `machine_token` field which can be extracted and used.

## Environment Variable Method (Headless)

For deployments where you can't or don't want to run the interactive CLI flow (e.g., containers, CI environments, locked-down servers), inject a machine token directly via environment variable.

### Prerequisites

You must obtain a machine token payload from Runbeam Cloud. This is typically provided by an administrator or generated via the Runbeam Cloud API.

### Set the machine token

```bash
# Pre-provisioned machine token payload (JSON string)
export RUNBEAM_MACHINE_TOKEN='{
  "machine_token":"mt_...",
  "expires_at":"2025-12-31T23:59:59Z",
  "gateway_id":"550e8400-e29b-41d4-a716-446655440000",
  "gateway_code":"my-gateway",
  "abilities":[]
}'

# Optional (recommended in containers): stable encryption key for persistent token storage
export RUNBEAM_ENCRYPTION_KEY=AGE-SECRET-KEY-1...
```

### How it works

Harmony:
1. Reads `RUNBEAM_MACHINE_TOKEN` at startup
2. Validates the token format and expiry
3. Stores it encrypted (using `RUNBEAM_ENCRYPTION_KEY` if provided)
4. Uses the machine token for autonomous Runbeam Cloud API calls

### Token persistence

- **With `RUNBEAM_ENCRYPTION_KEY`**: Token survives container restarts (encrypted on disk)
- **Without `RUNBEAM_ENCRYPTION_KEY`**: Token is only in-memory and is lost if Harmony restarts

For production containers, always provide `RUNBEAM_ENCRYPTION_KEY`.

## Environment Variables Reference

### RUNBEAM_MACHINE_TOKEN

Machine token payload for headless/pre-provisioned deployments.

**Format**: JSON string containing:
- `machine_token` (required): Token from Runbeam Cloud
- `expires_at` (required): ISO 8601 expiry timestamp
- `gateway_id` (required): Gateway UUID from Runbeam Cloud
- `gateway_code` (required): Gateway instance ID
- `abilities` (optional): Token scopes/abilities

**Example**:
```json
{
  "machine_token": "mt_abc123...",
  "expires_at": "2025-12-31T23:59:59Z",
  "gateway_id": "550e8400-e29b-41d4-a716-446655440000",
  "gateway_code": "prod-gateway",
  "abilities": []
}
```

### RUNBEAM_ENCRYPTION_KEY

Base64-encoded age X25519 encryption key for secure token storage.

**When used**:
- Recommended for all container deployments
- Required for token persistence across restarts

**Generation**:
```bash
# Linux
export RUNBEAM_ENCRYPTION_KEY=$(age-keygen | base64 -w 0)

# macOS
export RUNBEAM_ENCRYPTION_KEY=$(age-keygen | base64 | tr -d '\n')
```

**Storage**: Keep in your platform's secret manager (AWS Secrets Manager, HashiCorp Vault, etc.), not in version control.

### RUNBEAM_JWT_SECRET

Shared secret for validating user JWTs during the `/authorize` flow.

**When used**:
- Required only for the interactive CLI authorization flow
- Not needed if using `RUNBEAM_MACHINE_TOKEN` directly

**Format**: String (32+ characters recommended)

## Complete Deployment Example

### Docker Compose

```yaml
version: '3.8'

services:
  harmony:
    image: ghcr.io/aurabx/harmony:latest
    ports:
      - "8080:8080"
      - "9090:9090"
    volumes:
      - ./config:/etc/harmony:ro
      - harmony-data:/data
    environment:
      - RUST_LOG=info
      - RUNBEAM_MACHINE_TOKEN=${RUNBEAM_MACHINE_TOKEN}
      - RUNBEAM_ENCRYPTION_KEY=${RUNBEAM_ENCRYPTION_KEY}
    restart: unless-stopped

volumes:
  harmony-data:
```

Then run:
```bash
export RUNBEAM_MACHINE_TOKEN='{"machine_token":"mt_...","expires_at":"...","gateway_id":"...","gateway_code":"..."}'
export RUNBEAM_ENCRYPTION_KEY=$(age-keygen | base64 | tr -d '\n')

docker compose up -d
```

### Kubernetes

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: harmony-runbeam
  namespace: production
type: Opaque
stringData:
  machine-token: |
    {"machine_token":"mt_...","expires_at":"...","gateway_id":"...","gateway_code":"..."}
  encryption-key: AGE-SECRET-KEY-1...
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: harmony
  namespace: production
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: harmony
        image: ghcr.io/aurabx/harmony:latest
        env:
        - name: RUNBEAM_MACHINE_TOKEN
          valueFrom:
            secretKeyRef:
              name: harmony-runbeam
              key: machine-token
        - name: RUNBEAM_ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: harmony-runbeam
              key: encryption-key
```

## Troubleshooting

### Authorization Fails with 403 Forbidden

**Check**:
1. `[runbeam] enabled = true` is in your Harmony config
2. Harmony's Management API is accessible at the configured address
3. Your user token is still valid (`runbeam verify`)

**Solution**:
```bash
# Reload config if you just enabled Runbeam
runbeam harmony:reload -l my-label

# Re-authorize
runbeam harmony:authorize -l my-label
```

### Machine Token Expired

**Symptoms**: Harmony logs show authorization errors

**Solution**:
```bash
# Re-authorize to get a fresh token
runbeam harmony:authorize -l my-label
```

Tokens are valid for ~30 days. Set a calendar reminder to renew before expiry.

### Token Not Persisting (Container Restarts)

**Symptoms**: Token works initially but is lost after restart

**Solution**: Set `RUNBEAM_ENCRYPTION_KEY`:
```bash
export RUNBEAM_ENCRYPTION_KEY=$(age-keygen | base64 | tr -d '\n')
# Update your container/k8s deployment with this env var
```

## For More Information

Implementation-level details on the authorization flow, token validation, and security model:

- `projects/harmony-proxy/docs/security.md` — Runbeam Cloud authorization flow, JWT validation, and token storage mechanics
- `projects/harmony-proxy/docs/management-api.md` — Management API endpoints (`POST /{base_path}/authorize`, `POST /{base_path}/token`)
