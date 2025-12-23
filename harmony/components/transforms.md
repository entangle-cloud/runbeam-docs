---
sidebar_position: 8
---

# Transforms

Transforms use JOLT (JSON to JSON transformation language) to reshape data as it flows through pipelines. Transform files are stored in the directory specified by `transforms_path` in `config.toml`.

## Transform Files

Transform files are JSON specifications stored in the `transforms/` directory:

```
config.toml
transforms/
  ├── patient_to_fhir.json
  ├── observation_mapping.json
  └── dicom_metadata.json
```

## Using Transforms in Pipelines

Reference transform files in middleware configuration:

```toml
# pipelines/api.toml

[middleware.patient_transform]
type = "transform"

[middleware.patient_transform.options]
spec_path = "patient_to_fhir.json"  # Relative to transforms/ directory
apply = "left"                       # Apply to request
fail_on_error = true
```

## Transform Options

### spec_path

Path to the JOLT specification file (relative to `transforms_path`):

```toml
[middleware.my_transform.options]
spec_path = "patient_to_fhir.json"
```

### apply

When to apply the transform:

- `"left"` - Apply to incoming requests (default)
- `"right"` - Apply to outgoing responses
- `"both"` - Apply to both requests and responses

```toml
[middleware.my_transform.options]
spec_path = "normalize.json"
apply = "both"
```

### fail_on_error

Whether to fail the request if transformation fails:

- `true` - Fail the request (default, recommended)
- `false` - Log error and continue

```toml
[middleware.my_transform.options]
spec_path = "optional_enrichment.json"
fail_on_error = false
```

### debug

Enable debug logging of transform input and output:

- `true` - Log transform input/output at DEBUG level
- `false` - No debug output (default)

```toml
[middleware.my_transform.options]
spec_path = "patient_to_fhir.json"
debug = true
```

When enabled, the middleware logs:
- Transform input (including both `data` payload and `context` with request/response details)
- Transform output after applying the JOLT specification

Requires `RUST_LOG=harmony=debug` or higher to be visible in logs. Useful for troubleshooting transform specifications and understanding data flow.

## JOLT Specification Format

Transform files contain JOLT specifications in JSON format:

```json
// transforms/patient_to_fhir.json
[
  {
    "operation": "shift",
    "spec": {
      "id": "identifier[0].value",
      "firstName": "name[0].given[0]",
      "lastName": "name[0].family",
      "birthDate": "birthDate"
    }
  }
]
```

## Common Transform Patterns

### Field Mapping

Map fields from one structure to another:

**Before:**
```json
{
  "patient_id": "12345",
  "patient_name": "John Doe",
  "dob": "1980-01-15"
}
```

**Transform:**
```json
[
  {
    "operation": "shift",
    "spec": {
      "patient_id": "id",
      "patient_name": "name",
      "dob": "birthDate"
    }
  }
]
```

**After:**
```json
{
  "id": "12345",
  "name": "John Doe",
  "birthDate": "1980-01-15"
}
```

### Nested Data

Extract or restructure nested data:

**Before:**
```json
{
  "patient": {
    "demographics": {
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
}
```

**Transform:**
```json
[
  {
    "operation": "shift",
    "spec": {
      "patient": {
        "demographics": {
          "firstName": "name.given[0]",
          "lastName": "name.family"
        }
      }
    }
  }
]
```

**After:**
```json
{
  "name": {
    "given": ["Jane"],
    "family": "Smith"
  }
}
```

### Adding Static Values

Add constant values to the output:

**Before:**
```json
{
  "id": "12345",
  "name": "John Doe"
}
```

**Transform:**
```json
[
  {
    "operation": "shift",
    "spec": {
      "*": "&"
    }
  },
  {
    "operation": "default",
    "spec": {
      "resourceType": "Patient",
      "status": "active"
    }
  }
]
```

**After:**
```json
{
  "id": "12345",
  "name": "John Doe",
  "resourceType": "Patient",
  "status": "active"
}
```

### Array Handling

Transform arrays of data:

**Before:**
```json
{
  "observations": [
    {
      "code": "BP",
      "value": "120/80"
    },
    {
      "code": "TEMP",
      "value": "98.6"
    }
  ]
}
```

**Transform:**
```json
[
  {
    "operation": "shift",
    "spec": {
      "observations": {
        "*": {
          "code": "entry[&1].resource.code",
          "value": "entry[&1].resource.value"
        }
      }
    }
  }
]
```

**After:**
```json
{
  "entry": [
    {
      "resource": {
        "code": "BP",
        "value": "120/80"
      }
    },
    {
      "resource": {
        "code": "TEMP",
        "value": "98.6"
      }
    }
  ]
}
```

## Transform Middleware Types

### Transform (JOLT)

Standard JSON-to-JSON transformations:

```toml
[middleware.data_transform]
type = "transform"

[middleware.data_transform.options]
spec_path = "mapping.json"
apply = "left"
fail_on_error = true
```

### Metadata Transform

Transform request metadata (key-value pairs used for routing):

```toml
[middleware.metadata_transform]
type = "metadata_transform"

[middleware.metadata_transform.options]
spec_path = "metadata_mapping.json"
apply = "left"
fail_on_error = true
```

## Multiple Transforms

Chain multiple transforms in a pipeline:

```toml
[pipelines.multi_transform]
middleware = [
    "normalize_input",    # 1. Normalize incoming data
    "enrich_data",        # 2. Add additional fields
    "format_output"       # 3. Format for target system
]

[middleware.normalize_input]
type = "transform"
[middleware.normalize_input.options]
spec_path = "normalize.json"

[middleware.enrich_data]
type = "transform"
[middleware.enrich_data.options]
spec_path = "enrich.json"

[middleware.format_output]
type = "transform"
[middleware.format_output.options]
spec_path = "format.json"
```

## Testing Transforms

Test transforms using the echo backend:

```toml
[pipelines.transform_test]
endpoints = ["test_endpoint"]
middleware = ["test_transform"]
backends = ["echo"]

[middleware.test_transform]
type = "transform"
[middleware.test_transform.options]
spec_path = "my_transform.json"
apply = "left"

[backends.echo]
service = "echo"
```

Send test requests:

```bash
curl -X POST http://localhost:8080/test \
  -H "Content-Type: application/json" \
  -d '{"id": "123", "firstName": "John", "lastName": "Doe"}'
```

## Automatic Download from Runbeam Cloud

When using Runbeam Cloud integration, transform files are automatically downloaded:

1. Configure middleware with transform ID:
   ```toml
   [middleware.patient_transform.options]
   spec_path = "01k81xczrw551e1qj9rgrf0319.json"
   ```

2. Harmony downloads the specification from Runbeam Cloud
3. File is saved to `transforms/01k81xczrw551e1qj9rgrf0319.json`
4. Transform is ready to use

## Hot Reload

Transform files are automatically reloaded when changed:

1. Edit a transform file in `transforms/`
2. Save the file
3. Harmony detects the change
4. New transform applies to subsequent requests

**No service restart required.**

## Validation

Transform specifications are validated when loaded:

- JSON syntax must be valid
- JOLT operations must be recognized
- Spec structure must be correct

Invalid transforms are rejected with error details in logs.

## Examples

See the [harmony-proxy repository](https://github.com/aurabx/harmony/tree/main/examples/transform) for complete examples:

- `transforms/patient_to_fhir.json` - Patient data transformation
- `transforms/observation_mapping.json` - Observation mapping
- `transforms/metadata_set_dimse_op.json` - Metadata transformation

## JOLT Resources

Learn more about JOLT transformations:

- [JOLT Documentation](https://github.com/bazaarvoice/jolt)
- [JOLT Playground](https://jolt-demo.appspot.com/) - Test transforms interactively

## Next Steps

- [Configure Middleware →](./middleware.md) - Use transforms in pipelines
- [Configure Pipelines →](../configuration/pipelines.md) - Define request processing
- [Configure Authentication →](./authentication.md) - Secure your gateway
- [Configure Services →](./services.md) - Connect to backends
