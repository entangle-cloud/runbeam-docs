---
sidebar_position: 1
---

# Services

Services are the core building blocks of Harmony's data pipeline architecture. They define how data enters Harmony (via **Endpoints**) and how Harmony communicates with external systems (via **Backends**).

```
Protocol Request → Endpoint → RequestEnvelope → Pipeline → Backend → External Target
```

## Endpoints

Endpoints define protocol entry points into the Harmony pipeline. Each endpoint is associated with a service that handles protocol-specific data conversion to/from the internal `Envelope` format.

### Architecture

Endpoints work with Protocol Adapters to process requests:

```
Protocol Request → Protocol Adapter → Service → RequestEnvelope → Pipeline
```

The endpoint configuration specifies:
- Which service type to use (e.g., `http`, `fhir`, `jmix`, `dicomweb`, `dicom`)
- Service-specific options (e.g., `path_prefix` for HTTP endpoints, `local_aet` for DICOM)
- How the service should construct request/response envelopes

### HTTP (Passthru)

A basic HTTP endpoint for generic HTTP traffic.

**Service behavior:**
- Accepts an HTTP request and converts it into a `RequestEnvelope`
- Takes a `ResponseEnvelope` and converts it into an HTTP response
- Preserves headers, query parameters, and body

**Configuration:**
```toml
[endpoints.api_passthrough]
service = "http"
[endpoints.api_passthrough.options]
path_prefix = "/api"
```

### FHIR

Extends the HTTP endpoint with FHIR-specific handling for healthcare interoperability.

**Service behavior:**
- Accepts an HTTP request and converts it into a `RequestEnvelope`
- Provides FHIR-aware request/response handling
- Takes a `ResponseEnvelope` and converts it into a FHIR-compliant HTTP response

**Configuration:**
```toml
[endpoints.fhir_server]
service = "fhir"
[endpoints.fhir_server.options]
path_prefix = "/fhir"
```

### JMIX

JMIX endpoint registers a strict, fixed set of routes for the JMIX healthcare data exchange format.

**Service behavior:**
- Registers fixed routes under the configured `path_prefix`
- Handles JMIX data package operations

**Supported routes** (under configured `path_prefix`):
- `GET {prefix}/api/jmix/{id}` - Retrieve JMIX package
- `GET {prefix}/api/jmix/{id}/manifest` - Retrieve package manifest
- `GET {prefix}/api/jmix?studyInstanceUid=...` - Query by Study Instance UID
- `POST {prefix}/api/jmix` - Create JMIX package

**Configuration:**
```toml
[endpoints.jmix_exchange]
service = "jmix"
[endpoints.jmix_exchange.options]
path_prefix = "/data"
```

### DICOMweb

Provides DICOMweb QIDO-RS (Query) and WADO-RS (Retrieve) endpoints for medical imaging.

**Service behavior:**
- Accepts DICOMweb requests and converts them into `RequestEnvelope`
- Supports QIDO-RS queries and WADO-RS retrieval operations
- Currently returns 501 Not Implemented for all endpoints (skeleton implementation)

**Supported routes:**
- `GET /dicomweb/studies` - Query for studies (QIDO-RS)
- `GET /dicomweb/studies/{study_uid}/series` - Query for series (QIDO-RS)
- `GET /dicomweb/studies/{study_uid}/series/{series_uid}/instances` - Query for instances (QIDO-RS)
- `GET /dicomweb/studies/{study_uid}/metadata` - Retrieve study metadata (WADO-RS)
- `GET /dicomweb/studies/{study_uid}/series/{series_uid}/metadata` - Retrieve series metadata (WADO-RS)
- `GET /dicomweb/studies/{study_uid}/series/{series_uid}/instances/{instance_uid}/metadata` - Retrieve instance metadata (WADO-RS)
- `GET /dicomweb/studies/{study_uid}/series/{series_uid}/instances/{instance_uid}` - Retrieve instance (WADO-RS)
- `GET /dicomweb/studies/{study_uid}/series/{series_uid}/instances/{instance_uid}/frames/{frame_numbers}` - Retrieve frames (WADO-RS)
- `GET /dicomweb/bulkdata/{bulk_data_uri}` - Bulk data retrieval (WADO-RS)

**Configuration:**
```toml
[endpoints.dicomweb_pacs]
service = "dicomweb"
[endpoints.dicomweb_pacs.options]
path_prefix = "/pacs"
```

### DICOM SCP (Service Class Provider)

Provides DICOM DIMSE SCP endpoint for receiving incoming DICOM requests via TCP/IP.

**Service behavior:**
- Accepts incoming DIMSE connections (C-FIND, C-MOVE, C-GET, C-ECHO)
- Converts DIMSE operations to `RequestEnvelope` via protocol adapter
- Routes requests through the pipeline system
- Returns DIMSE responses to the calling SCU

**Supported operations:**
- `C-ECHO` - Connectivity test (enabled by default)
- `C-FIND` - Query for studies/series/images
- `C-MOVE` - Request dataset transfer to destination AET
- `C-GET` - Direct dataset retrieval
- `C-STORE` - Store incoming datasets (planned)

**Configuration:**
```toml
[endpoints.dicom_qr_scp]
service = "dicom_scp"
[endpoints.dicom_qr_scp.options]
local_aet = "QR_SCP"           # Local Application Entity Title (required)
bind_addr = "0.0.0.0"           # Bind address (default: 0.0.0.0)
port = 11112                    # Listen port (default: 11112)
enable_echo = true              # Enable C-ECHO (default: true)
enable_find = true              # Enable C-FIND (default: false)
enable_move = true              # Enable C-MOVE (default: false)
enable_get = true               # Enable C-GET (default: false)
storage_dir = "./data/dicom"   # Storage directory (optional)
```

**Note:** The DICOM SCP endpoint uses the `DimseAdapter` protocol adapter, not HTTP. It listens on the configured port for incoming DIMSE associations.

---

## Backends

Backends enable the pipeline to communicate with external systems (targets). Backends operate within the unified `PipelineExecutor` and handle the "backend invocation" step of the pipeline.

### Architecture

```
RequestEnvelope → Backend Service → External Target → ResponseEnvelope
```

**Backend responsibilities:**
- Convert `RequestEnvelope` to protocol-specific requests
- Communicate with external targets (HTTP endpoints, DICOM PACS, databases, etc.)
- Convert responses back to `ResponseEnvelope`
- Handle target selection when multiple targets are configured

**Note:** Backends run inside the `PipelineExecutor`, not in protocol adapters. All protocols use the same backend implementations.

### HTTP (Passthru)

A basic HTTP backend for connecting to HTTP/HTTPS targets.

**Service behavior:**
- Accepts a `RequestEnvelope` and converts it to an HTTP request
- Sends request to configured target
- Converts HTTP response back to `ResponseEnvelope`
- Preserves headers, status codes, and body

**Configuration:**
```toml
[backends.external_api]
service = "http"
[backends.external_api.options]
base_url = "https://external-api.example.com/v1"
```

### FHIR

Extends the HTTP backend for FHIR resource servers.

**Service behavior:**
- FHIR-aware request/response handling
- Supports FHIR search parameters and operations
- Validates FHIR content types

**Configuration:**
```toml
[backends.fhir_server]
service = "fhir"
[backends.fhir_server.options]
base_url = "https://hapi.fhir.org/baseR4"
```

### DICOMweb

Extends the HTTP backend for DICOMweb QIDO-RS/WADO-RS/STOW-RS targets.

**Service behavior:**
- DICOMweb-compliant request formatting
- Multipart handling for STOW-RS
- QIDO-RS query parameter construction

**Configuration:**
```toml
[backends.pacs_dicomweb]
service = "dicomweb"
[backends.pacs_dicomweb.options]
base_url = "https://pacs.example.com/dicomweb"
```

### DICOM SCU (Service Class User)

A DICOM DIMSE backend for connecting to remote DICOM PACS via C-ECHO/C-FIND/C-MOVE/C-GET operations.

**Service behavior:**
- Converts `RequestEnvelope` to DICOM DIMSE operations (SCU - outgoing requests)
- Communicates with remote DICOM nodes using AE titles
- Converts DICOM responses back to `ResponseEnvelope`
- Supports C-ECHO, C-FIND, C-MOVE, C-GET operations

**Supported operations:**
- `C-ECHO` - Test connectivity
- `C-FIND` - Query for studies/series/images
- `C-MOVE` - Request dataset transfer
- `C-GET` - Retrieve datasets

**Configuration options:**
- `aet` (string, required): Remote Application Entity Title
- `host` (string, required): PACS hostname or IP address
- `port` (integer, required): PACS port number
- `local_aet` (string, optional): Local AE title (default: "HARMONY_SCU")
- `dimse_retrieve_mode` (string, optional): DICOM retrieval mode (default: "get")
  - `"get"` (C-GET): Direct image retrieval, works without PACS-side AE configuration
  - `"move"` (C-MOVE): Requires PACS to know SCU's AE title and network address
- `use_tls` (boolean, optional): Enable TLS encryption (default: false)
- `incoming_store_port` (integer, optional): Port for C-STORE SCP when using C-MOVE
- `persistent_store_scp` (boolean, optional): Keep persistent C-STORE SCP listening

**Configuration:**
```toml
[backends.orthanc_pacs]
service = "dicom_scu"
[backends.orthanc_pacs.options]
aet = "ORTHANC"
host = "localhost"
port = 4242
local_aet = "HARMONY_SCU"
dimse_retrieve_mode = "get"
incoming_store_port = 11112
persistent_store_scp = true
use_tls = false
```

**Prerequisites:** Requires DCMTK installed for DICOM operations.

### Echo (Test)

A simple echo backend that reflects the request back as the response.

**Service behavior:**
- Returns the request envelope as the response
- Useful for testing and debugging pipelines
- No external communication

**Configuration:**
```toml
[backends.test_echo]
service = "echo"
```

---

## Target Selection

Backends can have multiple targets configured. The backend service decides which target to use based on:
- Load balancing strategy
- Health checks
- Request routing rules

**Example with multiple targets:**
```toml
[backends.load_balanced_api]
service = "http"
targets = ["api1", "api2"]

[targets.api1]
url = "https://api1.example.com"

[targets.api2]
url = "https://api2.example.com"
```

---

## Related Documentation

- [Configuration](../configuration) - Complete configuration guide
- [Middleware](../configuration/middleware) - Request/response transformation
- [Authentication](./authentication) - Security and auth setup
