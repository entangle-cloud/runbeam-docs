---
sidebar_position: 5
---

# Services

Services are the core building blocks of Harmony's data pipeline architecture. They define how data enters Harmony (via **Endpoints**) and how Harmony communicates with external systems (via **Backends**).

```mermaid
graph LR
    A[Protocol Request] --> B[Endpoint]
    B --> C[RequestEnvelope]
    C --> D[Pipeline]
    D --> E[Backend]
    E --> F[External Target]
    
    classDef default fill:#7a7df1,stroke:#fff,stroke-width:2px,color:#fff,fontSize:18px
```

## Endpoints

Endpoints define protocol entry points into the Harmony pipeline. Each endpoint is associated with a service that handles protocol-specific data conversion to/from the internal `Envelope` format.

### Architecture

Endpoints work with Protocol Adapters to process requests:

```mermaid
graph LR
    A[Protocol Request] --> B[Protocol Adapter]
    B --> C[Service]
    C --> D[RequestEnvelope]
    D --> E[Pipeline]
    
    classDef default fill:#7a7df1,stroke:#fff,stroke-width:2px,color:#fff,fontSize:18px
```

The endpoint configuration specifies:
- Which service type to use (e.g., `http`, `fhir`, `jmix`, `dicomweb`, `dicom`)
- Service-specific options (e.g., `path_prefix` for HTTP endpoints, `local_aet` for DICOM)
- How the service should construct request/response envelopes

### HTTP (Passthru)

A basic HTTP endpoint for generic HTTP traffic with automatic multi-format support.

**Service behavior:**
- Accepts an HTTP request and converts it into a `RequestEnvelope`
- Takes a `ResponseEnvelope` and converts it into an HTTP response
- Preserves headers, query parameters, and body
- Automatically parses multiple content types

**Note:** This service handles both HTTP/1.x and HTTP/3 incoming requests. When a network has `[network.*.http3]` configured, the Http3Adapter serves the same endpoints using HTTP/3 over QUIC. No endpoint configuration changes are needed - the same `http` service works for both protocols.

**Supported Content Types:**

1. **JSON** (`application/json`, `application/fhir+json`, `application/dicom+json`)
   - Direct pass-through to normalized data
   - Default when Content-Type missing

2. **XML** (`application/xml`, `text/xml`, `application/soap+xml`)
   - Converted to JSON structure
   - Attributes prefixed with `@`
   - XXE attack prevention enabled

3. **CSV** (`text/csv`)
   - Parsed into array of row objects
   - First row treated as header
   - Formula injection prevention (fields starting with `=`, `+`, `-`, `@` are escaped)

4. **Form URL-Encoded** (`application/x-www-form-urlencoded`)
   - Converted to flat JSON object
   - Array notation supported with `[]`

5. **Multipart Form Data** (`multipart/form-data`)
   - Fields and files separated in normalized structure
   - File metadata captured (filename, content_type, size, checksum)
   - Files NOT saved to disk automatically

6. **Binary Content** (`image/*`, `video/*`, `audio/*`, `application/pdf`, `application/octet-stream`)
   - Binary data preserved in envelope
   - Metadata extracted (content_type, size, checksum)

**Configuration:**
```toml
[endpoints.api_passthrough]
service = "http"
[endpoints.api_passthrough.options]
path_prefix = "/api"
```

**Content Limits:**
```toml
[proxy.content_limits]
max_body_size = 10485760      # 10MB (default)
max_csv_rows = 10000           # Maximum CSV rows
max_xml_depth = 100            # Maximum XML nesting
max_multipart_files = 10       # Maximum files per upload
max_form_fields = 1000         # Maximum form fields
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

```mermaid
graph LR
    A[RequestEnvelope] --> B[Backend Service]
    B --> C[External Target]
    C --> D[ResponseEnvelope]
    
    classDef default fill:#7a7df1,stroke:#fff,stroke-width:2px,color:#fff,fontSize:18px
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

### HTTP/3 (QUIC)

An HTTP/3 backend for connecting to targets over QUIC with TLS 1.3.

**Service behavior:**
- Connects to backends using HTTP/3 over QUIC (UDP transport)
- Built-in TLS 1.3 encryption (always enabled)
- Multiplexed streams without head-of-line blocking
- Supports custom CA certificates for self-signed servers

**Configuration options:**
- `host` (string, required): Target server hostname
- `port` (integer, optional): Target server port (default: 443)
- `base_path` (string, optional): Base URL path prefix
- `ca_cert_path` (string, optional): Path to PEM-encoded CA certificate for self-signed servers
- `timeout_secs` (integer, optional): Request timeout in seconds (default: 30)

**Configuration:**
```toml
[backends.h3_api]
service = "http3"
[backends.h3_api.options]
host = "api.example.com"
port = 443
base_path = "/v1"
# ca_cert_path = "./certs/custom-ca.pem"  # For self-signed certs
# timeout_secs = 30
```

**When to use HTTP/3:**
- High-latency or unreliable networks (mobile, satellite)
- Backend servers that support HTTP/3
- When you need connection migration (e.g., mobile clients changing networks)
- To avoid TCP head-of-line blocking on multiplexed connections

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

### Storage (Filesystem/S3)

A backend for reading and writing files to local storage or S3-compatible object storage.

**Service behavior**:
- **GET**: Reads file at path resolved from `read_pattern`
- **POST/PUT**: Writes request body to path resolved from `write_pattern`
- Supports path templating with metadata, UUIDs, and timestamps
- Returns `Location` header and JSON status on successful write

**Configuration**:
```toml
[backends.storage_example]
service = "storage"
[backends.storage_example.options]
root = "./data"  # Local path or "s3://bucket/prefix"
read_pattern = "files/{uuid}.bin"
write_pattern = "files/{uuid}.bin"
```

**S3 Configuration**:
To use S3, set `root` to an S3 URI (`s3://bucket-name/prefix`) and provide credentials:
```toml
[backends.s3_storage]
service = "storage"
[backends.s3_storage.options]
root = "s3://my-bucket/uploads"
region = "us-east-1"
access_key_id = "..."      # Optional (can use env vars)
secret_access_key = "..."  # Optional (can use env vars)
endpoint = "..."           # Optional (for MinIO/custom S3)
```

**Path Templating**:
Patterns can use placeholders replaced at runtime:
- `{uuid}`: Generates a random UUID (v4)
- `{timestamp}`: Current timestamp (RFC3339)
- `{metadata_key}`: Replaced by value from request metadata (e.g. `{tenant}` from JWT)
- `{field_name}`: Replaced by value from normalized data (e.g. `{PatientID}`)

**Example**:
```toml
[backends.patient_docs]
service = "storage"
[backends.patient_docs.options]
root = "./patient_data"
# Write to: ./patient_data/{tenant}/{PatientID}/{uuid}.dcm
write_pattern = "{tenant}/{PatientID}/{uuid}.dcm"
```

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

- [Configuration](../configuration/) - Complete configuration guide
- [Middleware](./middleware.md) - Request/response transformation
- [Authentication](./authentication.md) - Security and auth setup
