---
sidebar_position: 6
---

# Middleware

Middleware extends the request/response pipeline to authenticate, enrich, or transform data as it flows through Harmony.

## Overview

Middleware operates within Harmony's pipeline executor and processes envelopes for all protocols (HTTP, FHIR, DICOM/DICOMweb, JMIX, HL7).

### Pipeline Flow

```mermaid
graph LR
    A[Request] --> B[Incoming Middleware]
    B --> C[Backend]
    C --> D[Outgoing Middleware]
    D --> E[Response]
    
    classDef default fill:#7a7df1,stroke:#fff,stroke-width:2px,color:#fff,fontSize:18px
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

## Middleware Catalog

### Authentication

- [Basic Auth →](./middleware/basic-auth.md) - Validate `Authorization: Basic` credentials.
- [JWT Auth →](./middleware/jwt-auth.md) - Verify `Authorization: Bearer` tokens (RS256/HS256).

### Transformation

- [Transform (JOLT) →](./middleware/transform-jolt.md) - Apply JSON-to-JSON transformations.
- [Metadata Transform →](./middleware/metadata-transform.md) - Apply JOLT transforms to request metadata.

### Filtering

- [Path Filter →](./middleware/path-filter.md) - Reject requests that don’t match allowed URL patterns.

### Healthcare-specific

- [JMIX Builder →](./middleware/jmix-builder.md) - Build JMIX packages from DICOM operation responses.
- [DICOMweb Bridge →](./middleware/dicomweb-bridge.md) - Bridge DICOMweb (QIDO/WADO) to DIMSE operations.
- [DICOM Flatten →](./middleware/dicom-flatten.md) - Flatten/unflatten DICOM JSON for simplified processing.

### Debugging

- [Log Dump →](./middleware/log-dump.md) - Dump envelopes to logs with configurable redaction.
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

- [View configuration examples →](../configuration/)
- [Learn about services and backends →](./services.md)
- [Learn about authentication →](./authentication.md)
- [Learn about transforms →](./transforms.md)
- [See complete examples on GitHub →](https://github.com/aurabx/harmony/tree/main/examples)
