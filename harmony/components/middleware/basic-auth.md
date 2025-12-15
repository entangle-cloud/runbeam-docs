---
sidebar_label: Basic Auth
---

# Basic Auth

Validates username/password combinations from `Authorization: Basic` headers.

## Configuration

```toml
[middleware.basic_auth_example]
type = "basic_auth"
username = "test_user"
password = "test_password"
# token_path = "/tmp/test_token"  # optional
```

## Options

- `username` (string, required) - Username to validate
- `password` (string, required) - Password to validate
- `token_path` (string, optional) - File path for pre-shared token

## Error handling

Authentication failures return HTTP `401 Unauthorized`.

## Notes

Only use with HTTPS in production.

## Related

- [← Middleware](../middleware.md)
