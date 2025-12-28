---
sidebar_position: 4
---

# Data Meshes

A Data Mesh is a collection of Harmony proxies that can securely communicate with each other. Mesh networking enables distributed API access patterns where proxies can route requests to other mesh members via their ingress/egress definitions.

## Overview

Mesh configuration consists of three components:

- **Mesh**: Groups ingress and egress definitions for authenticated inter-proxy communication
- **Ingress**: Binds URLs to a pipeline's endpoint, optionally with mesh authentication
- **Egress**: Binds a pipeline's backend for outgoing mesh requests

Note: Ingress definitions work independently of meshes—they bind URLs to pipelines even without mesh membership. When an ingress is added to a mesh, JWT authentication is automatically applied.

## Configuration Files

Ingress and egress definitions are configured within pipeline files. A pipeline can have zero or more ingress and egress definitions.

Mesh definitions (which group ingresses/egresses for authentication) are stored in a dedicated directory (default: `mesh/`) relative to your main `config.toml` file:

```toml
[proxy]
id = "my-gateway"
mesh_path = "mesh"  # default
```

Each mesh can be defined in its own TOML file within this directory, or multiple meshes can be combined in a single file.

## Mesh Definition

A mesh groups ingress and egress points together:

```toml
[mesh.my-mesh]
type = "http3"           # Protocol: "http" or "http3"
provider = "local"       # Provider: "local" or "runbeam"
auth_type = "jwt"        # Authentication type (default: "jwt")
jwt_secret = "your-shared-secret-key"  # For HS256 symmetric auth
ingress = ["api-ingress", "webhook-ingress"]
egress = ["partner-egress"]
description = "Production mesh for partner integrations"
enabled = true
```

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | Yes | - | Protocol type: `http` or `http3` |
| `provider` | string | Yes | - | Mesh provider: `local` or `runbeam` |
| `auth_type` | string | No | `jwt` | Authentication type (currently only `jwt`) |
| `jwt_secret` | string | No* | - | HS256 shared secret for JWT signing/verification |
| `jwt_private_key_path` | string | No* | - | Path to RSA private key (PEM) for RS256 signing |
| `jwt_public_key_path` | string | No* | - | Path to RSA public key (PEM) for RS256 verification |
| `ingress` | array | No | `[]` | List of ingress definition names |
| `egress` | array | No | `[]` | List of egress definition names |
| `description` | string | No | - | Human-readable description |
| `enabled` | boolean | No | `true` | Whether the mesh is active |

\* For `local` provider, you must configure either `jwt_secret` (for HS256) or the RSA key paths (for RS256). For `runbeam` provider, JWT handling is managed by Runbeam Cloud.

### Providers

- **local**: Self-managed mesh with local JWT keys. JWT tokens are generated and validated locally using the configured `jwt_secret` or RSA keys.
- **runbeam**: Runbeam Cloud managed mesh. JWT tokens are fetched from and validated by the Runbeam Cloud API.

## JWT Authentication

Mesh members authenticate with each other using JWT (JSON Web Tokens). The MeshAuth middleware is automatically injected into the pipeline when requests flow through a mesh context—you don't need to configure it manually.

### How It Works

- **Egress (outgoing requests)**: A JWT is automatically generated and attached to the `Authorization` header before requests are sent to other mesh members.
- **Ingress (incoming requests)**: The JWT in the `Authorization` header is validated before the request is processed.

### JWT Claims

Mesh JWTs include the following claims:

| Claim | Description |
|-------|-------------|
| `iss` | Issuer - the mesh name |
| `sub` | Subject - source proxy identifier |
| `aud` | Audience - target mesh member (optional) |
| `iat` | Issued at timestamp |
| `exp` | Expiration timestamp (5 minutes from issue) |
| `mesh_id` | Mesh identifier for validation |

### HS256 (Symmetric Key)

Use a shared secret for simple deployments where all mesh members share the same key:

```toml
[mesh.my-mesh]
type = "http"
provider = "local"
jwt_secret = "your-secure-shared-secret-at-least-32-chars"
ingress = ["api-ingress"]
egress = ["partner-egress"]
```

### RS256 (Asymmetric Keys)

Use RSA key pairs for more secure deployments where signing and verification use different keys:

```toml
[mesh.my-mesh]
type = "http"
provider = "local"
jwt_private_key_path = "/etc/harmony/mesh/private.pem"  # For signing (egress)
jwt_public_key_path = "/etc/harmony/mesh/public.pem"    # For verification (ingress)
ingress = ["api-ingress"]
egress = ["partner-egress"]
```

Generate RSA keys with:

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem
```

### Runbeam Provider

When using the Runbeam provider, JWT handling is managed by Runbeam Cloud:

```toml
[mesh.my-mesh]
type = "http3"
provider = "runbeam"
# No jwt_secret or key paths needed - managed by Runbeam Cloud
ingress = ["api-ingress"]
egress = ["partner-egress"]
```

## Ingress Configuration

An ingress binds URLs to a pipeline's endpoint. Ingresses are defined within pipeline configuration files:

```toml
# In a pipeline file (e.g., pipelines/api.toml)
[pipelines.api-pipeline.mesh.ingress.api-ingress]
type = "http"
urls = ["https://api.example.com", "https://api2.example.com"]
endpoint = "api-endpoint"  # Optional: defaults to first endpoint in pipeline
mode = "default"           # Optional: "default" or "mesh"
description = "API ingress for partner requests"
enabled = true
```

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | Yes | - | Protocol type: `http` or `http3` |
| `urls` | array | Yes | - | URLs that map to this ingress |
| `endpoint` | string | No | First endpoint | Optional endpoint override |
| `mode` | string | No | `default` | Request mode: `default` or `mesh` |
| `description` | string | No | - | Human-readable description |
| `enabled` | boolean | No | `true` | Whether the ingress is active |

When a request matches one of the `urls`, it will be routed to the pipeline using the specified endpoint (or the first endpoint if not specified).

### Mode

The `mode` field controls whether non-mesh requests are allowed:

- **`default`** (or omitted): All requests are processed, regardless of mesh membership. If the ingress is in a mesh and the request has a valid mesh JWT, the request is processed with mesh context. Otherwise, it proceeds without mesh context.
- **`mesh`**: Only requests that match a mesh are allowed. If a request arrives without a valid mesh JWT (or the JWT doesn't match a mesh this ingress belongs to), the request is rejected with a 403 Forbidden response.

```toml
# Mesh-only ingress - rejects non-mesh requests
[pipelines.api-pipeline.mesh.ingress.internal-api]
type = "http"
urls = ["https://internal.example.com"]
mode = "mesh"
```

### Ingress Without Mesh

Ingresses work independently of meshes for simple URL→pipeline binding:

```toml
[pipelines.my-pipeline.mesh.ingress.public-api]
type = "http"
urls = ["https://api.example.com/v1"]
# No mesh membership needed - requests are routed without JWT auth
```

## Egress Configuration

An egress defines how this proxy can send requests to other mesh members. Egresses are defined within pipeline configuration files:

```toml
# In a pipeline file (e.g., pipelines/api.toml)
[pipelines.api-pipeline.mesh.egress.partner-egress]
type = "http3"
backend = "partner-backend"  # Optional: defaults to first backend in pipeline
mode = "default"             # Optional: "default" or "mesh"
description = "Egress to partner system"
enabled = true
```

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | Yes | - | Protocol type: `http` or `http3` |
| `backend` | string | No | First backend | Optional backend override |
| `mode` | string | No | `default` | Request mode: `default` or `mesh` |
| `description` | string | No | - | Human-readable description |
| `enabled` | boolean | No | `true` | Whether the egress is active |

Outgoing mesh requests will be routed through the specified backend (or the first backend in the pipeline if not specified).

### Mode

Similar to ingress, the `mode` field controls whether non-mesh requests are allowed through the egress:

- **`default`** (or omitted): All requests are processed, regardless of mesh context.
- **`mesh`**: Only requests with mesh context are allowed. If the request doesn't have a valid mesh context (i.e., it didn't enter via a mesh ingress), the request is rejected with a 403 Forbidden response.

```toml
# Mesh-only egress - only allows requests with mesh context
[pipelines.api-pipeline.mesh.egress.secure-partner]
type = "http3"
backend = "partner-backend"
mode = "mesh"
```

## Complete Example

Here's a complete example showing pipeline and mesh configuration:

### Pipeline Configuration (`pipelines/healthcare.toml`)

```toml
[pipelines.healthcare]
description = "Healthcare data pipeline"
networks = ["default"]
endpoints = ["fhir-endpoint", "dicomweb-endpoint"]
backends = ["partner-fhir-backend", "partner-dicomweb-backend"]

# Ingress definitions (bind URLs to this pipeline)
[pipelines.healthcare.mesh.ingress.fhir-ingress]
type = "http"
urls = ["https://fhir.myorg.com/r4"]
endpoint = "fhir-endpoint"  # Optional override
description = "FHIR R4 API ingress"

[pipelines.healthcare.mesh.ingress.dicom-ingress]
type = "http3"
urls = ["https://dicom.myorg.com/wado-rs"]
endpoint = "dicomweb-endpoint"
description = "DICOMweb ingress"

# Egress definitions (for outgoing mesh requests)
[pipelines.healthcare.mesh.egress.partner-fhir]
type = "http3"
backend = "partner-fhir-backend"
description = "Egress to partner FHIR server"

[pipelines.healthcare.mesh.egress.partner-dicom]
type = "http3"
backend = "partner-dicomweb-backend"
description = "Egress to partner DICOMweb server"
```

### Mesh Configuration (`mesh/production.toml`)

```toml
# Mesh definition groups ingresses/egresses for JWT authentication
[mesh.production]
type = "http3"
provider = "local"
auth_type = "jwt"
jwt_secret = "production-mesh-secret-key-min-32-chars"
ingress = ["fhir-ingress", "dicom-ingress"]
egress = ["partner-fhir", "partner-dicom"]
description = "Production data mesh for healthcare integrations"
enabled = true
```

## Request Flow

When a mesh request is processed:

1. **Outgoing (Egress)**: 
   - Proxy receives a request destined for another mesh member
   - Looks up egress configuration matching the target
   - For local provider: Generates JWT using stored certificate
   - For runbeam provider: Fetches JWT from Runbeam Cloud
   - Upgrades connection to HTTP/3 (if configured)
   - Sends request through the referenced backend

2. **Incoming (Ingress)**:
   - Proxy receives request from another mesh member
   - Validates JWT token against mesh membership
   - Routes request to the referenced endpoint

## Validation

Harmony validates mesh configuration at startup:

- Ingress must have at least one URL
- If endpoint is specified, it must exist in the pipeline
- If backend is specified, it must exist in the pipeline
- Mesh must reference valid ingress and egress definitions
- URLs must be properly formatted

Invalid configurations will cause startup to fail with descriptive error messages.
