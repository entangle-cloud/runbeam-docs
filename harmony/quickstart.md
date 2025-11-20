---
sidebar_position: 2
---

# Quick Start

Get Harmony Proxy running in 5 minutes.

## Installation

Choose your preferred installation method:

- **[Pre-built Binaries →](./installation#pre-built-binaries-recommended)** (Fastest - no build tools required)
- **[Docker →](./installation#docker)** (Container-based deployment)
- **[Build from Source →](./installation#build-from-source)** (For contributors and custom builds)

For detailed installation instructions including all platforms and configuration options, see the [Installation Guide](./installation).

## Docker

Basic docker install:

```bash
docker pull aurabox/harmony:latest

docker run -d -p 8080:8080 aurabox/harmony
```

## Docker Compose

The fastest way to try Harmony with the examples:

```bash
# Clone the repository
git clone https://github.com/aurabx/harmony.git
cd harmony

# Start with Docker Compose
docker compose up

# Test the service
curl -i http://localhost:8080/echo
```

**Ports:**
- **8080** - Main service endpoints
- **9090** - Management API (if enabled)

## Try the Examples

The Github repository includes several example configurations:

```bash
# Basic HTTP echo
cargo run -- --config examples/basic-echo/config.toml

# FHIR with authentication
cargo run -- --config examples/fhir/config.toml

# JSON transformations
cargo run -- --config examples/transform/config.toml

# FHIR to DICOM translation
cargo run -- --config examples/fhir-to-dicom/config.toml

# JMIX packaging
cargo run -- --config examples/jmix/config.toml

# DICOM SCU operations
cargo run -- --config examples/dicom-backend/config.toml

# DICOM SCP endpoint
cargo run -- --config examples/dicom-scp/config.toml

# DICOMweb support
cargo run -- --config examples/dicomweb/config.toml

# JMIX to DICOM workflow
cargo run -- --config examples/jmix-to-dicom/config.toml
```

Each example includes:
- A README explaining the use case
- A `config.toml` file
- Pipeline definitions
- Sample requests
- A `demo.sh` file to run the example

Explore the `examples/` directory in the repository to see more.

## Next Steps

Now that you have Harmony running:

1. [Learn about configuration →](./configuration/)
2. [Understand authentication →](./authentication)
3. [Deploy to production →](./deployment)
