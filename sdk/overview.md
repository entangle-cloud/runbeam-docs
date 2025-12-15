---
sidebar_position: 1
slug: /
---

# Runbeam SDK

A Rust library for integrating with the Runbeam Cloud API.

## Overview

The Runbeam SDK provides a comprehensive Rust library for building applications that integrate with Runbeam Cloud. It handles authentication, API access, and secure token storage with minimal configuration.

## Key Features

### Dual Authentication Support

#### JWT Token Validation
- RS256 signature verification
- Automatic JWKS caching
- Local token validation
- Extract claims (user info, team info)

#### Laravel Sanctum API Tokens
- Server-side validation
- Simpler auth flow
- Format: `{id}|{token}`

Both methods work interchangeably with all API operations.

### Comprehensive API Client

- **Gateway Management** - List, get, create, update, delete gateways
- **Service Management** - Manage services and endpoints
- **Backend Management** - Configure backends and pipelines
- **Token Management** - Gateway authorization and machine tokens

### Secure Token Storage

Automatic secure storage with **no configuration required**:

**Encrypted Filesystem** - age X25519 encryption for secure offline storage

### Machine Tokens

- Autonomous gateway authentication
- 30-day expiry with renewal
- Secure storage with instance isolation
- Pre-provisioning support for headless deployments

### Cross-Platform

Works on macOS, Linux, and Windows with no platform-specific code needed.

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
runbeam-sdk = "0.4.0"
```

## Quick Start

### Using JWT Tokens

```rust
use runbeam_sdk::{
    RunbeamClient,
    validate_jwt_token,
    save_token,
    load_token,
    MachineToken,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Validate user JWT token
    let user_token = "eyJhbGci...";
    let claims = validate_jwt_token(user_token, 24).await?;
    
    // Create API client
    let client = RunbeamClient::new(claims.api_base_url());
    
    // Authorize gateway and get machine token
    let response = client.authorize_gateway(
        user_token,
        "gateway-123",
        None,
        None
    ).await?;
    
    // Save machine token securely
    let instance_id = "my-gateway";
    let machine_token = MachineToken::new(
        response.machine_token,
        response.expires_at,
        response.gateway.id,
        response.gateway.code,
        response.abilities,
    );
    save_token(instance_id, &machine_token).await?;
    
    Ok(())
}
```

### Using Sanctum Tokens

```rust
use runbeam_sdk::{RunbeamClient, save_token, MachineToken};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create API client
    let client = RunbeamClient::new("https://api.runbeam.io");
    
    // Authorize with Sanctum token
    let sanctum_token = "1|abc123def456...";
    let response = client.authorize_gateway(
        sanctum_token,
        "gateway-123",
        None,
        None
    ).await?;
    
    // Save machine token
    let machine_token = MachineToken::new(
        response.machine_token,
        response.expires_at,
        response.gateway.id,
        response.gateway.code,
        response.abilities,
    );
    save_token("my-gateway", &machine_token).await?;
    
    Ok(())
}
```

## Architecture

- **`runbeam_api/client.rs`** - HTTP client for Runbeam Cloud API
- **`runbeam_api/jwt.rs`** - JWT validation with JWKS caching
- **`runbeam_api/resources.rs`** - API resource types (Gateway, Service, etc.)
- **`runbeam_api/token_storage.rs`** - Token persistence operations
- **`runbeam_api/types.rs`** - Error types and API structures
- **`storage/mod.rs`** - Storage backend trait and implementations

## Next Steps

- [Runbeam Cloud →](/runbeam) - Learn about Runbeam Cloud
- [Harmony Proxy →](/harmony) - Explore Harmony Proxy
