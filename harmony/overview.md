---
sidebar_position: 1
slug: /
---

# Harmony Proxy

A secure, pluggable proxy for data meshes, with first-class healthcare support (FHIR, DICOM/DICOMweb, JMIX).

## Overview

Harmony Proxy is an extensible data mesh proxy/gateway for heterogeneous systems. It routes requests through configurable endpoints, middleware, and services/backends to connect systems securely.

## Who Is This For?

- **Platform teams** building data meshes or integration hubs (healthcare and beyond)
- **Developers** integrating HTTP/JSON services and healthcare protocols (FHIR, DICOM/DICOMweb)
- **Operators** who need auditable, configurable request/response pipelines

## Architecture

Harmony uses a pipeline architecture:

```mermaid
graph LR
    A[Request] --> B[Endpoint]
    B --> C[Middleware Chain]
    C --> D[Backend]
    D --> E[Response]
    
    classDef default fill:#7a7df1,stroke:#fff,stroke-width:2px,color:#fff,fontSize:18px
```

1. **Endpoints** - Define public-facing routes and protocols
2. **Middleware** - Process and transform requests/responses in order
3. **Backends** - Perform the actual work (HTTP calls, DICOM operations, etc.)

All components are configured via TOML files and can be hot-reloaded.

## Status

Harmony Proxy is under active development. For more information, visit [harmonyproxy.com](https://harmonyproxy.com).

## Next Steps

- [Quick Start →](./quickstart) - Get Harmony running in 5 minutes
- [Installation →](./installation) - Detailed installation guide
- [Configuration →](./configuration/) - Learn about configuration options
