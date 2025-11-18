---
sidebar_position: 4
---

# Configuration

Harmony Proxy uses TOML-based configuration files to define how it processes requests. This guide covers the core configuration concepts and how to set up your gateway.

## Configuration File Structure

A basic Harmony configuration includes:

- **Networks** - Bind addresses and ports
- **Endpoints** - Public-facing routes
- **Middleware** - Request/response processors
- **Backends** - Where work is performed
- **Storage** - Local filesystem paths

## Basic Configuration Example

```toml
# config.toml
[server]
host = "0.0.0.0"
port = 8080

[management]
enabled = true
host = "127.0.0.1"
port = 9090

[storage]
path = "./tmp"

# Include pipeline definitions
[pipelines]
include_dir = "./pipelines"
```

## Networks

Define where Harmony listens for requests:

```toml
[server]
host = "0.0.0.0"  # Listen on all interfaces
port = 8080        # Main service port

[management]
enabled = true
host = "127.0.0.1"  # Localhost only for admin API
port = 9090
```

## Endpoints

Endpoints define the public-facing routes your gateway exposes. Each endpoint is associated with a pipeline that processes requests. Harmony supports multiple endpoint types including HTTP, FHIR, JMIX, DICOMweb, and DICOM SCP.

For complete endpoint documentation and configuration examples, see [Services - Endpoints →](./services#endpoints)

## Pipelines

Pipelines connect endpoints to middleware and backends. Create a `pipelines/` directory:

```toml
# pipelines/echo.toml
id = "echo-pipeline"
description = "Simple echo service"

[[middleware]]
type = "jwt-auth"
config = { secret = "your-secret" }

[[middleware]]
type = "logging"

[backend]
type = "echo"
```

## Middleware

Middleware processes requests and responses as they flow through the pipeline. You can use middleware for:

- **Authentication** - JWT, Basic Auth, API keys
- **Transformations** - JOLT transformations for JSON data
- **Filtering** - Path-based request filtering
- **Healthcare protocols** - DICOMweb bridging, JMIX packaging

Middleware executes in the order defined in your pipeline configuration.

Example:

```toml
# Authentication first
[[middleware]]
type = "jwt_auth"
public_key_path = "/etc/harmony/jwt_public.pem"

# Then path filtering
[[middleware]]
type = "path_filter"
rules = ["/Patient", "/Observation"]

# Finally transformations
[[middleware]]
type = "transform"
spec_path = "transforms/patient.json"
```

For complete middleware documentation, see [Middleware →](./middleware)

## Backends

Backends connect your gateway to external systems and handle communication with external targets. Each pipeline configuration specifies which backend to use for processing requests. Harmony supports backends for HTTP APIs, FHIR servers, DICOMweb PACS, DICOM DIMSE nodes, and more.

For complete backend documentation and configuration examples, see [Services - Backends →](./services#backends)

## Storage

Configure local storage for temporary files:

```toml
[storage]
path = "./tmp"  # Relative to working directory
```

## Hot Reload

Harmony supports hot configuration reload for most changes:

1. Update your configuration files
2. Harmony detects changes automatically
3. New configuration is applied without restart

**Note**: Some changes (like port binding) require a restart.

## Configuration from Runbeam Cloud

When connected to Runbeam Cloud, Harmony can pull configuration automatically:

1. Authorize your gateway: `runbeam harmony:authorize`
2. Configuration syncs automatically
3. Changes in Runbeam Cloud are hot-reloaded

## Environment Variables

Override configuration with environment variables:

```bash
# Storage location
export HARMONY_STORAGE_PATH=/var/harmony/data

# Server port
export HARMONY_SERVER_PORT=8080

# Log level
export RUST_LOG=info
```

## Examples

Harmony includes complete examples in the `examples/` directory:

- `basic-echo/` - Simple HTTP passthrough
- `fhir/` - FHIR with authentication
- `transform/` - JOLT transformations
- `dicomweb/` - DICOMweb support

## Next Steps

- [Set up authentication →](./authentication)
- [Deploy to production →](./deployment)
- [View examples on GitHub →](https://github.com/aurabx/harmony/tree/main/examples)
