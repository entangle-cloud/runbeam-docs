---
sidebar_position: 1
---

# Configuration Overview

Harmony Proxy uses a layered configuration approach with three main components.

## Configuration Structure

```
my-gateway/
├── config.toml                    # System configuration
├── pipelines/                      # Pipeline definitions
 │   └── my-pipeline.toml
├── transforms/                    # JOLT transform specs (optional)
 │   └── my-transform.json
```

## System Configuration

**File**: `config.toml`

System-level settings that define how Harmony runs:

- Network interfaces and ports
- Logging and storage
- Runbeam Cloud integration
- Service and middleware type registrations

[Learn more about System Configuration →](./system)

## Pipeline Configuration

**Directory**: `pipelines/`

Pipeline files define how requests flow through your gateway:

- Endpoints (public-facing routes)
- Middleware chains (authentication, transforms)
- Backends (where requests are sent)
- Routing rules

[Learn more about Pipeline Configuration →](./pipelines)

## Transform Specifications

**Directory**: `transforms/`

JOLT specifications for data transformation:

- JSON to JSON transformations
- Field mapping and restructuring
- Data enrichment
- Format conversion

[Learn more about Transforms →](../transforms)

## Configuration Flow

1. **System** - Harmony loads `config.toml` for runtime settings
2. **Pipelines** - Loads all files from `pipelines/` directory
3. **Transforms** - Loads transform specs from `transforms/` as referenced

All three layers support hot-reload - changes are detected and applied automatically.

## Quick Example

### config.toml
```toml
[proxy]
id = "my-gateway"
pipelines_path = "pipelines"
transforms_path = "transforms"

[network.http_net]
[network.http_net.http]
bind_address = "0.0.0.0"
bind_port = 8080

[storage]
backend = "filesystem"
[storage.options]
path = "./tmp"
```

### pipelines/api.toml
```toml
[pipelines.api]
networks = ["http_net"]
endpoints = ["api_endpoint"]
middleware = ["auth", "transform"]
backends = ["api_backend"]

[endpoints.api_endpoint]
service = "http"
[endpoints.api_endpoint.options]
path_prefix = "/api"

[middleware.auth]
type = "jwt_auth"

[middleware.transform]
type = "transform"
[middleware.transform.options]
spec_path = "normalize.json"

[backends.api_backend]
service = "http"
[backends.api_backend.options]
url = "http://backend.example.com"
```

### transforms/normalize.json
```json
[
  {
    "operation": "shift",
    "spec": {
      "id": "identifier",
      "name": "displayName"
    }
  }
]
```

## Next Steps

- [System Configuration →](./system) - Configure runtime settings
- [Pipeline Configuration →](./pipelines) - Define request processing
- [Services →](../services) - Connect to backends
- [Middleware →](../middleware) - Set up authentication and transformations
- [Authentication →](../authentication) - Secure your gateway
- [Transforms →](../transforms) - Transform data
