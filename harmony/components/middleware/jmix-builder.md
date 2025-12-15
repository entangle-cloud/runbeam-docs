---
sidebar_label: JMIX Builder
---

# JMIX Builder

Builds JMIX envelopes from DICOM operation responses. Handles caching, indexing, and ZIP file creation.

## Configuration

```toml
[middleware.jmix_builder]
type = "jmix_builder"
[middleware.jmix_builder.options]
skip_hashing = true   # Skip SHA256 hashing for faster processing
skip_listing = true   # Skip DICOM files from files.json manifest
```

## Options

- `skip_hashing` (bool, optional, default: false) - Skip SHA256 file hashing for performance
- `skip_listing` (bool, optional, default: false) - Skip DICOM files from manifest

## Left side behavior (request processing)

- Processes GET/HEAD requests for JMIX endpoints (`/api/jmix/{id}`, `/api/jmix?studyInstanceUid=...`)
- Serves cached JMIX packages if they exist locally
- Returns manifest.json for manifest requests
- Passes through to backends when no local package exists

## Right side behavior (response processing)

- Detects DICOM "move"/"get" responses containing folder paths and instances
- Creates JMIX packages in storage using jmix-rs builder
- Copies DICOM files into package payload
- Writes manifest.json and metadata.json files
- Creates ZIP files for distribution
- Indexes packages by StudyInstanceUID
- Cleans up temporary DICOM files after ZIP creation

## Use case

Automatically converts DICOM responses into distributable JMIX packages for medical imaging workflows.

## Related

- [← Middleware](../middleware.md)
