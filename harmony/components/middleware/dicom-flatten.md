---
sidebar_label: DICOM Flatten
---

# DICOM Flatten

Flattens DICOM JSON structures for simplified processing, converting between standard DICOM JSON format (Part 18) and flat key-value pairs.

## Configuration

```toml
[middleware.dicom_flatten_example]
type = "dicom_flatten"
[middleware.dicom_flatten_example.options]
apply = "both"  # Flatten on request, unflatten on response
```

## Options

- `apply` (string, optional) - When to apply: `"left"` (flatten requests), `"right"` (unflatten responses), or `"both"` (default)

## Behavior

### Flatten (left side)

- Converts standard DICOM JSON with `{vr, Value}` structure to simple key-value pairs
- Tag ID → scalar value or nested structure for sequences
- Person Name (PN) VR: Extracts "Alphabetic" field
- Preserves VR metadata internally for reconstruction
- Example: `{"00100020": {"vr": "LO", "Value": ["PID123"]}}` → `{"00100020": "PID123"}`

### Unflatten (right side)

- Reconstructs standard DICOM JSON from flattened form
- Uses preserved VR metadata to restore proper structure
- Recreates sequences (SQ) from nested arrays
- Restores Person Name structure with Alphabetic field
- Example: `{"00100020": "PID123"}` → `{"00100020": {"vr": "LO", "Value": ["PID123"]}}`

## Supported VR types

- Scalars: LO, UI, SH, DA, TM, DT, PN (with special handling)
- Sequences (SQ): Recursive flattening of nested items
- Multi-valued: Arrays preserved as-is
- Empty values: Handled as return keys

## Snapshot preservation

- Original data snapshot stored before transformation
- Enables inspection of pre-transformation state
- Compatible with debugging and log dump middleware

## Use cases

- Simplify DICOM data for frontend/API consumption
- Bridge DICOM backends with systems expecting flat structures
- Round-trip transformations: flatten for processing, unflatten for DICOM compliance
- DICOM data export to simplified formats

## Related

- [← Middleware](../middleware.md)
