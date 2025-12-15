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
id = "harmony-gateway"           # Unique gateway identifier
pipelines_path = "pipelines"      # Directory containing pipeline files
transforms_path = "transforms"    # Directory containing JOLT transforms
```

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

**Note**: The `RUST_LOG` environment variable overrides `log_level` if set.

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
module = ""

[services.echo]
module = ""

[services.fhir]
module = ""

[services.dicomweb]
module = ""
```

These definitions make services available for use in pipeline configurations.

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

Harmony automatically detects changes to `config.toml` and reloads configuration:

### Zero-Downtime Changes

These changes apply immediately without interruption:
- Logging settings
- Storage configuration
- Service/middleware type registrations

### Requires Adapter Restart

These changes require restarting affected network adapters (brief ~1-2s interruption):
- Network bind addresses or ports
- Adding/removing networks
- WireGuard configuration

## Environment Variables

Environment variables supplement configuration:

### RUNBEAM_ENCRYPTION_KEY

Encryption key for secure machine token storage:

```bash
export RUNBEAM_ENCRYPTION_KEY=AGE-SECRET-KEY-...
```

Required for:
- Production container deployments
- Headless/CI environments

### RUNBEAM_JWT_SECRET

Shared secret for JWT validation from Runbeam Cloud:

```bash
export RUNBEAM_JWT_SECRET=your-secret-here
```

Required for Runbeam Cloud integration.

### RUST_LOG

Override log level with per-module filtering:

```bash
# Override log level for all modules
export RUST_LOG=harmony=debug

# Per-module filtering
export RUST_LOG=harmony::router=trace,harmony::middleware=debug,harmony=info
```

**Note**: `RUST_LOG` overrides the `logging.log_level` setting in `config.toml`.

## Next Steps

- [Define Pipelines →](./pipelines) - Create request processing pipelines
- [Configure Services →](../components/services.md) - Connect to backends
- [Configure Middleware →](../components/middleware.md) - Set up authentication and transformations
