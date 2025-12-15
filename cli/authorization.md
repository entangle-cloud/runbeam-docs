---
sidebar_position: 3
---

# Authorization Guide

After adding a Harmony instance, you need to authorize it to communicate with the Runbeam Cloud API.

## Authorizing a Harmony Instance

```bash
# Authorize a Harmony instance by label
runbeam harmony:authorize -l my-label

# Or by instance ID
runbeam harmony:authorize --id 1a2b3c4d
```

## Authorization Flow

The authorization process securely exchanges your user credentials for a machine-scoped token:

1. CLI loads your user authentication token
2. CLI calls the Runbeam Cloud API to authorize the gateway
3. Runbeam Cloud issues a machine-scoped token (30-day expiry)
4. CLI sends the token and encryption key to Harmony
5. Harmony stores the machine token encrypted with the provided key
6. Harmony can now make authenticated API calls to Runbeam Cloud

## Security Model

The authorization system is designed with multiple layers of security:

- **User tokens** are short-lived (used only for authorization)
- **Machine tokens** are encrypted at rest using age X25519 encryption
- Each Harmony instance can have its own encryption key
- Encryption keys are auto-generated or provided via `RUNBEAM_ENCRYPTION_KEY` environment variable
- You can revoke a Harmony instance's access independently
- Tokens can be renewed before expiry

## Encryption Key Management

The Runbeam SDK automatically manages encryption keys for secure token storage:

- Keys are generated automatically on first use
- Keys are stored at `~/.runbeam/<instance_id>/encryption.key` or provided via `RUNBEAM_ENCRYPTION_KEY` environment variable
- Keys are used transparently for encrypted filesystem token storage
- No manual key management is required

## Prerequisites

Before authorizing a Harmony instance, ensure:

1. You are logged in to Runbeam CLI:
   ```bash
   runbeam login
   ```

2. Your Harmony instance has Runbeam integration enabled in `config.toml`:
   ```toml
   [runbeam]
   enabled = true
   ```

If the Harmony proxy returns `403 Forbidden` during authorization, check that this configuration is present.

## Advanced Options

### Automatic Configuration Upload

After authorization, you can automatically upload the Harmony configuration to Runbeam Cloud:

```bash
runbeam harmony:authorize -l my-label --update
```

### Non-Interactive Mode

For CI/CD environments, use the `-y` flag to skip interactive prompts:

```bash
runbeam harmony:authorize -l my-label -y
```

When used without `--update`, configuration upload is skipped in non-interactive mode.

## Troubleshooting

### 403 Forbidden Error

If you receive a `403 Forbidden` error during authorization:

1. Check that `runbeam.enabled = true` is set in your Harmony `config.toml`
2. Reload the Harmony configuration:
   ```bash
   runbeam harmony:reload -l my-label
   ```
3. Try authorization again

### Expired Token

If your user token has expired:

1. Log out and log back in:
   ```bash
   runbeam logout
   runbeam login
   ```
2. Verify your token:
   ```bash
   runbeam verify
   ```
3. Try authorization again

### Machine Token Renewal

Machine tokens expire after 30 days. To renew:

1. Ensure you're logged in with a valid user token
2. Run the authorization command again:
   ```bash
   runbeam harmony:authorize -l my-label
   ```

The new machine token will replace the expired one.
