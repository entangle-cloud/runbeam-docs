---
sidebar_label: Log Dump
---

# Log Dump

Outputs request or response envelopes to the logs to help builders and tools create and debug pipelines. It provides a comprehensive view of the current request/response state, including original and normalized data.

## Configuration

```toml
[middleware.debug_dump]
type = "log_dump"
[middleware.debug_dump.options]
apply = "both"  # Dump both request and response
pretty = true   # Pretty print JSON
redact_headers = ["authorization", "cookie"]  # Redact sensitive headers
redact_metadata = ["api_key", "token"]     # Redact sensitive metadata
redact_data_fields = ["ssn", "password", "user.payment_details"]  # Redact normalized data fields
label = "after_transform"  # Help identify where in pipeline this occurred
max_bytes = 32768  # Limit for very large payloads
```

## Options

- `apply` (string, optional) - When to dump: `"left"`, `"right"`, or `"both"` (default: `"both"`)
- `pretty` (bool, optional) - Pretty print JSON output (default: true)
- `max_bytes` (integer, optional) - Maximum bytes to include in logs for large content (default: 65536)
- `redact_headers` (array of strings, optional) - Header names to redact (case-insensitive)
- `redact_metadata` (array of strings, optional) - Metadata keys to redact
- `redact_data_fields` (array of strings, optional) - Normalized data fields to redact (dot path notation)
- `label` (string, optional) - Optional label to distinguish multiple dump points

## Behavior

Output includes:

- Request/response details (method, URI, headers, cookies, query params, metadata)
- Normalized data and pre-transform snapshots (if available)
- Target details (backend routing information)
- Content metadata (format, parsing status, size)
- Configuration label and side indicator (left/right)

## Security considerations

- Always use redact options when dealing with production logs to avoid leaking PII or credentials
- Consider setting appropriate `max_bytes` to avoid log flooding
- Use `label` to help identify specific pipeline stages when using multiple dump points

## Log targeting

- All dump output uses the `harmony.dump` logging target
- Use `RUST_LOG=harmony.dump=info` to enable just dump logs (or `debug` for more verbose)
- Standard log filtering applies (can be directed to different files/destinations)

## Related

- [← Middleware](../middleware.md)
