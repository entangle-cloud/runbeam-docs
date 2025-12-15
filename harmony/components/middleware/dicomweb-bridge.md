---
sidebar_label: DICOMweb Bridge
---

# DICOMweb Bridge

Bridges DICOMweb HTTP requests (QIDO-RS/WADO-RS) to DICOM operations and converts responses back to DICOMweb format.

## Configuration

```toml
[middleware.dicomweb_bridge]
type = "dicomweb_bridge"
```

## Left side behavior (DICOMweb → DICOM)

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

## Right side behavior (DICOM → DICOMweb)

- **QIDO responses**: Converts DICOM find results to DICOMweb JSON arrays
- **WADO metadata**: Returns filtered JSON metadata based on includefield
- **WADO instances**: Creates multipart/related responses with DICOM files
- **WADO frames**: Decodes DICOM pixel data to JPEG/PNG images
- Handles both single-frame and multi-frame responses
- Supports content negotiation (Accept: image/jpeg, image/png)
- Provides proper error responses for unsupported transfer syntaxes

## Features

- Full DICOMweb QIDO-RS and WADO-RS compliance
- Automatic DICOM tag name to hex conversion
- Support for multiple query parameter values
- Includefield filtering for bandwidth optimization
- Multipart response handling for bulk data
- Frame-level image extraction with format conversion

## Use case

Enables DICOMweb endpoints to communicate with traditional DICOM PACS systems via DIMSE protocols.

## Related

- [← Middleware](../middleware.md)
