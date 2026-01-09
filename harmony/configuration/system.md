---
sidebar_position: 1
---

# System Configuration

System configuration defines the core runtime settings for Harmony Proxy in the main `config.toml` file.

## Configuration File

The main configuration file (typically `config.toml`) contains system-wide settings:

```toml
# config.toml
[proxy]
id = "harmony-gateway"
pipelines_path = "pipelines"
transforms_path = "transforms"

[runbeam]
enabled = false

[network.http_net]
enable_wireguard = false
interface = "wg0"

[network.http_net.http]
bind_address = "0.0.0.0"
bind_port = 8080

[logging]
log_level = "info"
log_to_file = true
log_file_path = "./tmp/harmony.log"

[storage]
backend = "filesystem"

[storage.options]
path = "./tmp"

[services.http]
module = ""

[services.echo]
module = ""

[middleware_types.transform]
module = ""

[middleware_types.policies]
module = ""
```

## Proxy Settings

Basic gateway identity and file locations:

```toml
[proxy]
id = "harmony-gateway"           # Unique gateway identifier (required)
pipelines_path = "pipelines"      # Directory containing pipeline files
transforms_path = "transforms"    # Directory containing JOLT transforms
```

**Fields:**
- `id` (string, required) - Unique identifier for this gateway instance. Used for cloud integration, machine token storage, and identifying the gateway in logs and monitoring systems. This value is provisioned by Runbeam and should not be used locally. (Since v0.12)
- `pipelines_path` (string, optional) - Directory containing pipeline configuration files (default: `"pipelines"`)
- `transforms_path` (string, optional) - Directory containing JOLT transform specifications (default: `"transforms"`)

## Network Configuration

Define network interfaces where Harmony listens for requests:

```toml
[network.http_net]
enable_wireguard = false
interface = "wg0"

[network.http_net.http]
bind_address = "0.0.0.0"  # Listen on all interfaces
bind_port = 8080           # Main service port
```

### Multiple Networks

You can define multiple networks for different purposes:

```toml
# Public-facing network
[network.public]
enable_wireguard = false

[network.public.http]
bind_address = "0.0.0.0"
bind_port = 8080

# Internal network
[network.internal]
enable_wireguard = false

[network.internal.http]
bind_address = "127.0.0.1"
bind_port = 8081
```

### HTTPS with TLS

Enable HTTPS (HTTP over TLS) by adding certificate paths to the `http` section:

```toml
[network.secure]
enable_wireguard = false

[network.secure.http]
bind_address = "0.0.0.0"
bind_port = 443
cert_path = "/etc/harmony/certs/fullchain.pem"
key_path = "/etc/harmony/certs/privkey.pem"
```

**HTTPS Configuration Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `bind_address` | string | Yes | TCP address to bind (e.g., "0.0.0.0") |
| `bind_port` | integer | Yes | TCP port (typically 443 for HTTPS) |
| `cert_path` | string | Optional | Path to TLS certificate chain (PEM format) |
| `key_path` | string | Optional | Path to TLS private key (PEM format) |
| `force_https` | boolean | Optional | Force redirect HTTP to HTTPS (default: false) |

**Notes:**
- When both `cert_path` and `key_path` are provided, HTTPS is automatically enabled
- Uses TLS 1.3 with HTTP/1.1 and HTTP/2 ALPN
- Supports PKCS#8 (preferred) and RSA PKCS#1 private key formats
- Without certificates, the network runs plain HTTP

#### Generating Test Certificates

For development/testing, generate self-signed certificates:

```bash
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/CN=localhost"
```

**For production**, use:
- Let's Encrypt (certbot) for free certificates
- Your organization's certificate authority

#### Private Key Security

**Supported Key Formats:**
- PKCS#8 unencrypted (RSA and ECDSA) - preferred format
- RSA PKCS#1 unencrypted (legacy format)

**Supported Key Algorithms:**
- RSA (2048, 3072, 4096 bit)
- ECDSA (P-256, P-384, P-521 curves)

**Encrypted Keys Not Supported:**

Harmony does not support encrypted private keys. If you have encrypted keys, decrypt them first or store them in a secure mount.

```bash
# Decrypt PKCS#8 encrypted key
openssl pkcs8 -in encrypted_key.pem -out key.pem

# Decrypt RSA encrypted key (legacy format)
openssl rsa -in encrypted_rsa_key.pem -out key.pem

# Secure the unencrypted key
chmod 600 key.pem
chown harmony:harmony key.pem
```

**Security Best Practices:**

1. **File System Permissions** (primary security):
   ```bash
   chmod 600 /etc/harmony/certs/privkey.pem
   chown harmony:harmony /etc/harmony/certs/privkey.pem
   ```

2. **Secret Management** (recommended for production):
   - HashiCorp Vault
   - AWS Secrets Manager / Azure Key Vault / Google Cloud Secret Manager
   - Docker secrets or Kubernetes secrets

3. **Automated Certificate Management**:
   - Use certbot with Let's Encrypt
   - Set up renewal hooks to reload Harmony
   - Monitor certificate expiration

4. **Key Rotation**:
   - Rotate keys periodically (e.g., annually)
   - Use hot reload for zero-downtime certificate updates

### HTTP to HTTPS Redirect

Force all HTTP requests to redirect to HTTPS:

```toml
# Port 80: Redirects to HTTPS
[network.redirect]
enable_wireguard = false

[network.redirect.http]
bind_address = "0.0.0.0"
bind_port = 80
force_https = true

# Port 443: Serves HTTPS
[network.secure]
enable_wireguard = false

[network.secure.http]
bind_address = "0.0.0.0"
bind_port = 443
cert_path = "/etc/harmony/certs/fullchain.pem"
key_path = "/etc/harmony/certs/privkey.pem"
```

**How `force_https` works:**
- Returns HTTP 301 (Moved Permanently) redirect
- Redirects to `https://` equivalent URL
- Preserves original path and query parameters
- Only applies when TLS is NOT configured (no cert/key paths)
- Uses `Host` header to construct the HTTPS URL

### HTTP/3 (QUIC) Listener

Enable HTTP/3 support on a network by adding an `http3` section. HTTP/3 uses QUIC over UDP and requires TLS certificates:

```toml
[network.public]
enable_wireguard = false

# Standard HTTP/1.x and HTTP/2 (TCP)
[network.public.http]
bind_address = "0.0.0.0"
bind_port = 8080

# HTTP/3 over QUIC (UDP)
[network.public.http3]
bind_address = "0.0.0.0"
bind_port = 443
cert_path = "/etc/harmony/certs/fullchain.pem"
key_path = "/etc/harmony/certs/privkey.pem"
```

**HTTP/3 Configuration Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `bind_address` | string | Yes | UDP address to bind (e.g., "0.0.0.0") |
| `bind_port` | integer | Yes | UDP port for QUIC (typically 443) |
| `cert_path` | string | Yes | Path to TLS certificate chain (PEM format) |
| `key_path` | string | Yes | Path to TLS private key (PEM format) |

**Notes:**
- HTTP/3 always uses TLS 1.3 (built into QUIC)
- Both `http` and `http3` can be enabled on the same network
- Both adapters serve the same pipelines and endpoints
- HTTP/3 uses UDP, not TCP - ensure firewall rules allow UDP traffic

## Runbeam Cloud Integration

Configure connection to Runbeam Cloud for centralized management:

```toml
[runbeam]
enabled = false                                        # Enable/disable cloud integration
cloud_api_base_url = "https://api.runbeam.cloud"     # Cloud API endpoint
poll_interval_secs = 30                                # Polling interval (5-3600 seconds)
```

When `enabled = true`:
- Gateway can be authorized via the Management API
- Configuration automatically syncs from Runbeam Cloud
- Changes are hot-reloaded

When `enabled = false` (default):
- Gateway runs in standalone mode
- All configuration is file-based
- `/admin/authorize` endpoint returns 403

## Management API

Enable the management API for administrative operations:

```toml
[management]
enabled = true
base_path = "/admin"
network = "default"
```

The management API provides endpoints for:
- Gateway authorization (`/admin/authorize`)
- Health checks
- Configuration updates
- Status monitoring

## Logging

Configure logging output and verbosity:

```toml
[logging]
log_level = "info"                              # debug, info, warn, error
log_to_file = true                              # Enable file logging
log_file_path = "./tmp/harmony.log"            # Log file location
```

### Log Levels

- `debug` - Detailed debugging information
- `info` - General operational messages
- `warn` - Warning messages
- `error` - Error messages only

## Storage

Configure local storage for temporary files:

```toml
[storage]
backend = "filesystem"

[storage.options]
path = "./tmp"  # Relative to working directory
```

**Best Practice**: Use `./tmp` (relative to working directory) rather than `/tmp` (system temp).

## Service Types

Register available service types for endpoints and backends:

```toml
[services.http]
id = "http-service-v1"  # Optional: unique service instance identifier (v0.12.0+)
module = ""

[services.http3]
module = ""

[services.echo]
module = ""

[services.fhir]
module = ""

[services.dicomweb]
module = ""
```

These definitions make services available for use in pipeline configurations.

**Optional Fields (v0.12.0+):**
- `id` (string, optional) - Unique identifier for the service instance. Useful for tracking and debugging when running multiple instances of the same service type.

## Middleware Types

Register available middleware types:

```toml
[middleware_types.transform]
module = ""

[middleware_types.jwt_auth]
module = ""

[middleware_types.policies]
module = ""

[middleware_types.json_extractor]
module = ""
```

These definitions make middleware available for use in pipeline configurations.

## Hot Reload

Harmony automatically detects changes to `config.toml` and pipeline files, reloading configuration without requiring a restart. A file watcher monitors changes with a 200ms debounce.

**How it works:**
1. File watcher detects configuration changes
2. Changes are validated before applying
3. Diff computed to classify change impact
4. Configuration applied based on change type
5. Invalid configs are rejected, previous config retained

### Zero‑Downtime Changes

These changes are applied immediately via an atomic config swap with no adapter restarts:
- Middleware configuration (transforms, auth rules, path filters, JWT secrets, etc.)
- Route definitions (pipelines and their endpoint/backend references)
- Endpoint definitions
- Backend definitions (including URLs, timeouts, options)
- Logging settings
- Storage configuration
- Service/middleware type registrations
- Mesh / provider configuration (provider definitions, ingress/egress settings, auth, etc.)

### Changes That Trigger Automatic Adapter Restarts

When the config watcher detects these changes, it automatically performs a selective stop+start of the affected network adapters (causing a brief interruption while they restart):

- Network bind addresses or ports
- Adding or removing networks
- Any other network‑level changes, including:
   - Protocol‑specific adapter settings
   - TLS certificate / key paths
   - HTTP/3 / DIMSE settings

## Environment Variables

Harmony supports several environment variables that affect runtime behavior. Most are **runtime settings** rather than configuration overrides—they provide additional context for security, logging, and storage.

### RUNBEAM_ENCRYPTION_KEY

Encryption key for secure machine token storage (encrypted filesystem with age X25519 encryption).

```bash
export RUNBEAM_ENCRYPTION_KEY=AGE-SECRET-KEY-...
```

**When to set:**
- Production container deployments (recommended)
- Headless/CI environments
- When persistent token storage is needed across restarts

**Note:** Does not override TOML configuration; provides the encryption key used by token storage.

### RUNBEAM_MACHINE_TOKEN

Pre-provisioned machine token for headless deployments. Can be provided as a JSON object containing the machine token and metadata.

```bash
export RUNBEAM_MACHINE_TOKEN='{"machine_token":"...","expires_at":"...","gateway_id":"...","abilities":[...]}'
```

**When to set:**
- Headless/automated deployments where interactive authorization is not possible
- CI/CD pipelines
- Container orchestration environments

**Note:** If provided, Harmony will use this token immediately and save it to storage. Takes precedence over stored tokens. **If you use this, you do not need `RUNBEAM_JWT_SECRET`.**

### RUNBEAM_JWT_SECRET

Shared secret for validating user JWT tokens from Runbeam Cloud during interactive gateway authorization via the `/admin/authorize` endpoint.

```bash
export RUNBEAM_JWT_SECRET=your-secret-here
```

This token is set by the CLI during interactive authorisation and is generally not set manually. If you need manual authorisation, you should use the RUNBEAM_MACHINE_TOKEN.

**When is it used:**
- Required for **interactive** authorization flow (user logs in, calls `/admin/authorize` endpoint)
- Must match secret configured in Runbeam Cloud
- Falls back to development default if not set (logs warning)

**Note:** Only needed if you're using interactive authorization to *obtain* a machine token. If you already have a machine token (via `RUNBEAM_MACHINE_TOKEN`), this is not needed—the JWT secret's only purpose is to validate user tokens during the authorization exchange.

### RUNBEAM_PUSH_CONFIG_ON_STARTUP

Controls whether to push local configuration to Runbeam Cloud on startup (before polling begins).

```bash
export RUNBEAM_PUSH_CONFIG_ON_STARTUP=true  # or "1"
```

Triggers an automatic push and sync to Runbeam on system startup.

1. Pushes current configuration.
2. Retrieves full configuration from Runbeam Cloud.
3. Applies changes, ensuring cloud-assigned IDs are maintained.

This has the effect of ensuring that all local config is preserved, while also retrieving config on Runbeam, including IDs.

**Default:** `false` (disabled)

**When to set:**
- Initial deployment to sync local config with cloud
- After local configuration changes that should be persisted to cloud

**Note:** After push completes, Runbeam Cloud creates Change records for the pushed configs, which are then picked up by normal polling to ensure cloud-assigned IDs are maintained.

## Authorization Flows

**Interactive (user-initiated):**
1. User calls `runbeam harmony:authorize` from the CLI
2. CLI calls `/admin/authorize` with JWT token
3. Harmony validates JWT using `RUNBEAM_JWT_SECRET`
4. Harmony exchanges JWT for machine token from Runbeam Cloud API
5. Machine token stored locally for ongoing operations

**Headless (pre-provisioned):**
1. Machine token issued manually via Runbeam interface
2. Set `RUNBEAM_MACHINE_TOKEN` environment variable
3. Harmony uses token immediately for cloud operations
4. No `/admin/authorize` endpoint needed, no JWT secret needed

## Next Steps

- [Define Pipelines →](./pipelines) - Create request processing pipelines
- [Configure Services →](../components/services.md) - Connect to backends
- [Configure Middleware →](../components/middleware.md) - Set up authentication and transformations
