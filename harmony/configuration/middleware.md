---
sidebar_position: 2
---

# Middleware

Middleware extends the request/response pipeline to authenticate, enrich, or transform data as it flows through Harmony.

## Overview

Middleware operates within Harmony's pipeline executor and processes envelopes for all protocols (HTTP, FHIR, DICOM/DICOMweb, JMIX, HL7).

### Pipeline Flow

```
Request → Incoming Middleware → Backend → Outgoing Middleware → Response
```

**Middleware types**:
- **Authentication** - Run early in the pipeline (incoming side)
- **Transformation** - Can run on incoming requests, outgoing responses, or both
- **Path filtering** - Rejects requests based on URL patterns
- **Metadata transformation** - Modifies request metadata for routing decisions

**Key principle**: Middleware is protocol-agnostic. It works with envelopes, not raw protocol data.

## Error Handling

Middleware errors are mapped to HTTP status codes:

- **Authentication failures** (JWT/Basic auth issues): `401 Unauthorized`
- **All other middleware failures** (transform errors, internal failures): `500 Internal Server Error`

This ensures only actual authentication problems return 401, while configuration errors and other issues correctly return 500.

## Authentication Middleware

### Basic Auth

Validates username/password combinations from `Authorization: Basic` headers.

**Configuration**:

```toml
[middleware.basic_auth_example]
type = "basic_auth"
username = "test_user"
password = "test_password"
# token_path = "/tmp/test_token"  # optional
```

**Options**:
- `username` (string, required) - Username to validate
- `password` (string, required) - Password to validate
- `token_path` (string, optional) - File path for pre-shared token

**Error handling**: Authentication failures return HTTP 401 Unauthorized.

**Note**: Only use with HTTPS in production.

### JWT Auth

Verifies `Authorization: Bearer <token>` using cryptographic signature checks and claims validation.

**Supported modes**:
- **RS256** (default, recommended) - Verify with RSA public key
- **HS256** (explicit, dev/test only) - Verify with symmetric secret

**RS256 Configuration** (Production):

```toml
[middleware.jwt_auth]
type = "jwt_auth"
public_key_path = "/etc/harmony/jwt_public.pem"
issuer = "https://auth.example.com/"
audience = "harmony"
leeway_secs = 60
```

**HS256 Configuration** (Development):

```toml
[middleware.jwt_auth]
type = "jwt_auth"
use_hs256 = true
hs256_secret = "your-strong-secret"
issuer = "https://auth.example.com/"
audience = "harmony"
leeway_secs = 60
```

**Options**:
- `public_key_path` (string, required for RS256) - Path to RSA public key (PEM)
- `use_hs256` (bool, default: false) - Enable HS256 mode explicitly
- `hs256_secret` (string, required when `use_hs256 = true`) - Shared secret
- `issuer` (string, optional) - Expected `iss` claim
- `audience` (string, optional) - Expected `aud` claim
- `leeway_secs` (integer, optional) - Clock skew allowance for time-based claims

**Behavior**:
- Strict algorithm enforcement (no downgrades)
- Validates `exp`, `nbf`, and `iat` with optional leeway
- Validates `iss` and `aud` when configured
- Startup safety: panics if neither RS256 public key nor explicit HS256 is configured

**Best practices**:
- Place JWT middleware early in your pipeline
- Always use RS256 in production
- Never commit secrets to version control

**Error handling**: 
- Authentication failures (missing/invalid/expired tokens) return HTTP 401
- Internal errors (key parsing, config issues) return HTTP 500

## Transformation Middleware

### Transform (JOLT)

Applies JSON-to-JSON transformations using JOLT specifications.

**Configuration**:

```toml
[middleware.transform_example]
type = "transform"
[middleware.transform_example.options]
spec_path = "transforms/patient.json"
apply = "left"
fail_on_error = true
```

**Options**:
- `spec_path` (string, required) - Path to JOLT specification file
- `apply` (string, optional) - When to apply: `"left"` (request), `"right"` (response), or `"both"` (default: `"left"`)
- `fail_on_error` (bool, optional) - Whether to fail request on transform errors (default: true)

**Use cases**:
- Transform FHIR resource formats
- Normalize API request/response structures
- Extract or reshape data fields

### Metadata Transform

Applies JOLT transformations to request metadata (key-value pairs used for routing decisions).

**Configuration**:

```toml
[middleware.fhir_dimse_meta]
type = "metadata_transform"
[middleware.fhir_dimse_meta.options]
spec_path = "transforms/metadata_set_dimse_op.json"
apply = "left"
fail_on_error = true
```

**Options**:
- `spec_path` (string, required) - Path to JOLT specification file
- `apply` (string, optional) - When to apply: `"left"`, `"right"`, or `"both"` (default: `"left"`)
- `fail_on_error` (bool, optional) - Whether to fail on transform errors (default: true)

**Behavior**:
- Converts metadata to JSON for JOLT processing
- Only string-valued outputs are written back to metadata
- Preserves existing metadata fields not modified by transform
- Common use case: setting `dimse_op` field to control DICOM operations

## Filtering Middleware

### Path Filter

Filters incoming requests based on URL path patterns. Requests that don't match configured rules are rejected with HTTP 404.

**Configuration**:

```toml
[middleware.imagingstudy_filter]
type = "path_filter"
[middleware.imagingstudy_filter.options]
rules = ["/ImagingStudy", "/Patient", "/Patient/{id}"]
```

**Options**:
- `rules` (array of strings, required) - Path patterns to allow using matchit syntax

**Behavior**:
- Only applies to incoming requests
- Path matching uses subpath after endpoint's path_prefix
- Trailing slashes are normalized (`/ImagingStudy/` matches `/ImagingStudy`)
- On rejection: returns 404 with empty body and skips backend calls
- Supports matchit patterns: wildcards, parameters (`{id}`), catch-all (`*path`)

**Use cases**:
- Whitelist specific FHIR resource types
- Restrict access to certain API paths
- Implement coarse-grained authorization

## Healthcare-Specific Middleware

### JMIX Builder

Builds JMIX envelopes from DICOM operation responses. Handles caching, indexing, and ZIP file creation.

**Configuration**:

```toml
[middleware.jmix_builder]
type = "jmix_builder"
[middleware.jmix_builder.options]
skip_hashing = true   # Skip SHA256 hashing for faster processing
skip_listing = true   # Skip DICOM files from files.json manifest
```

**Options**:
- `skip_hashing` (bool, optional, default: false) - Skip SHA256 file hashing for performance
- `skip_listing` (bool, optional, default: false) - Skip DICOM files from manifest

**Left side behavior (request processing)**:
- Processes GET/HEAD requests for JMIX endpoints (`/api/jmix/{id}`, `/api/jmix?studyInstanceUid=...`)
- Serves cached JMIX packages if they exist locally
- Returns manifest.json for manifest requests
- Passes through to backends when no local package exists

**Right side behavior (response processing)**:
- Detects DICOM "move"/"get" responses containing folder paths and instances
- Creates JMIX packages in storage using jmix-rs builder
- Copies DICOM files into package payload
- Writes manifest.json and metadata.json files
- Creates ZIP files for distribution
- Indexes packages by StudyInstanceUID
- Cleans up temporary DICOM files after ZIP creation

**Use case**: Automatically converts DICOM responses into distributable JMIX packages for medical imaging workflows.

### DICOMweb Bridge

Bridges DICOMweb HTTP requests (QIDO-RS/WADO-RS) to DICOM operations and converts responses back to DICOMweb format.

**Configuration**:

```toml
[middleware.dicomweb_bridge]
type = "dicomweb_bridge"
```

**Left side behavior (DICOMweb → DICOM)**:

Maps DICOMweb URLs to DICOM operations:
- `/studies` → C-FIND at study level
- `/studies/{study}/series` → C-FIND at series level
- `/studies/{study}/series/{series}/instances` → C-FIND at instance level
- `/studies/{study}/series/{series}/instances/{instance}` → C-GET (WADO) or C-FIND (QIDO)
- `/studies/.../metadata` → C-FIND with full metadata
- `/studies/.../frames/{frames}` → C-GET for frame extraction

Features:
- Converts query parameters to DICOM identifiers with hex tags
- Processes `includefield` parameter for attribute filtering
- Sets appropriate return keys based on query level
- Distinguishes between QIDO (JSON) and WADO (binary) via Accept headers

**Right side behavior (DICOM → DICOMweb)**:

- **QIDO responses**: Converts DICOM find results to DICOMweb JSON arrays
- **WADO metadata**: Returns filtered JSON metadata based on includefield
- **WADO instances**: Creates multipart/related responses with DICOM files
- **WADO frames**: Decodes DICOM pixel data to JPEG/PNG images
- Handles both single-frame and multi-frame responses
- Supports content negotiation (Accept: image/jpeg, image/png)
- Provides proper error responses for unsupported transfer syntaxes

**Features**:
- Full DICOMweb QIDO-RS and WADO-RS compliance
- Automatic DICOM tag name to hex conversion
- Support for multiple query parameter values
- Includefield filtering for bandwidth optimization
- Multipart response handling for bulk data
- Frame-level image extraction with format conversion

**Use case**: Enables DICOMweb endpoints to communicate with traditional DICOM PACS systems via DIMSE protocols.

## Middleware Ordering

Order matters! Middleware executes in the order defined in your pipeline.

**Recommended ordering**:

```toml
# 1. Authentication first - reject unauthorized requests early
[[middleware]]
type = "jwt_auth"

# 2. Path filtering - reject invalid paths before processing
[[middleware]]
type = "path_filter"

# 3. Request transformations
[[middleware]]
type = "metadata_transform"

# 4. Backend processing happens here

# 5. Response transformations
[[middleware]]
type = "transform"
apply = "right"

# 6. Protocol bridges (DICOMweb, JMIX)
[[middleware]]
type = "dicomweb_bridge"
```

## Best Practices

### Performance
- Place authentication middleware first to reject requests early
- Use `fail_on_error = false` for optional transformations
- Enable `skip_hashing` and `skip_listing` for JMIX when appropriate
- Cache JOLT specifications by reusing middleware instances

### Security
- Always use RS256 for JWT in production
- Never commit secrets or keys to version control
- Use environment variables for sensitive config values
- Restrict path filter rules to minimum necessary paths

### Debugging
- Enable `RUST_LOG=harmony::middleware=debug` for detailed logs
- Test transformations independently before deploying
- Use `fail_on_error = false` during development to see partial results
- Check middleware order if requests aren't processed as expected

## Examples

### FHIR with Authentication

```toml
[[middleware]]
type = "jwt_auth"
public_key_path = "/etc/harmony/jwt_public.pem"
issuer = "https://auth.example.com"
audience = "fhir-api"

[[middleware]]
type = "path_filter"
[middleware.options]
rules = ["/Patient", "/Observation", "/ImagingStudy"]
```

### DICOM to DICOMweb Bridge

```toml
[[middleware]]
type = "dicomweb_bridge"

[[middleware]]
type = "jmix_builder"
[middleware.options]
skip_hashing = true
```

### Transform Pipeline

```toml
# Transform request
[[middleware]]
type = "transform"
[middleware.options]
spec_path = "transforms/request.json"
apply = "left"

# Transform response
[[middleware]]
type = "transform"
[middleware.options]
spec_path = "transforms/response.json"
apply = "right"
```

## Next Steps

- [View configuration examples →](../configuration)
- [Learn about services and backends →](./services)
- [See complete examples on GitHub →](https://github.com/aurabx/harmony/tree/main/examples)
