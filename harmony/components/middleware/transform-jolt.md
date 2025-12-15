---
sidebar_label: Transform (JOLT)
---

# Transform (JOLT)

Applies JSON-to-JSON transformations using JOLT specifications.

## Configuration

```toml
[middleware.transform_example]
type = "transform"
[middleware.transform_example.options]
spec_path = "transforms/patient.json"
apply = "left"
fail_on_error = true
```

## Options

- `spec_path` (string, required) - Path to JOLT specification file
- `apply` (string, optional) - When to apply: `"left"` (request), `"right"` (response), or `"both"` (default: `"left"`)
- `fail_on_error` (bool, optional) - Whether to fail request on transform errors (default: true)

## Use cases

- Transform FHIR resource formats
- Normalize API request/response structures
- Extract or reshape data fields

## Related

- [← Middleware](../middleware.md)
