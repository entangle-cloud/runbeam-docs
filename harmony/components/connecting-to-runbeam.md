---
sidebar_position: 8
---

# Connecting to Runbeam

When connected to Runbeam Cloud, Harmony uses machine tokens for autonomous authentication.

## Authorization

To authorize a Harmony instance with Runbeam Cloud, see the [Authorization Guide](/cli/authorization).

## Environment Variables

```bash
# Pre-provisioned token for headless deployments
export RUNBEAM_MACHINE_TOKEN='{"machine_token":"mt_...", ...}'

# Encryption key for token storage
export RUNBEAM_ENCRYPTION_KEY=AGE-SECRET-KEY-...

# JWT secret for validation
export RUNBEAM_JWT_SECRET=your-secret-here
```

## Troubleshooting

For authorization-related troubleshooting, see the [Authorization Guide](/cli/authorization#troubleshooting).

For token storage issues:

**Symptoms**: "Failed to save token" or "Storage backend unavailable"

**Solutions**:
- Check file permissions on `~/.runbeam/`
- Set `RUNBEAM_ENCRYPTION_KEY` explicitly
- Check logs: `RUST_LOG=debug harmony-proxy`

## Next Steps

- [Deploy to production →](../deployment/deployment.md)
- [Learn about authentication concepts →](/docs/concepts/authentication)
