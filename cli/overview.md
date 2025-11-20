---
sidebar_position: 1
slug: /
---

# Runbeam CLI

Command-line tool for managing Harmony instances and Runbeam Cloud.

## Overview

The Runbeam CLI is a cross-platform command-line tool that simplifies working with Harmony Proxy and Runbeam Cloud. It handles authentication, instance management, and gateway authorization with secure credential storage.

## Key Features

### Browser-Based OAuth Authentication
- Seamless OAuth login flow
- Opens browser for Runbeam authentication
- Secure token storage in OS keychain
- Automatic token validation (RS256)

### Harmony Instance Management
- Add and configure Harmony instances
- List and query instance information
- View pipelines and routes
- Remove instances when no longer needed

### Gateway Authorization
- Authorize Harmony instances to communicate with Runbeam Cloud
- Automatic encryption key management
- 30-day machine tokens for autonomous operation
- Secure token exchange flow

### Secure Credential Storage
- **OS Keychain** (preferred): macOS Keychain, Linux Secret Service, Windows Credential Manager
- **Encrypted Filesystem** (fallback): ChaCha20-Poly1305 AEAD encryption
- Automatic storage backend selection
- No plaintext credentials on disk

## Installation

### Download from GitHub Releases

Visit the [GitHub Releases page](https://github.com/aurabx/runbeam-cli/releases) and download the appropriate binary for your platform:

#### macOS
```bash
# Download and verify
wget https://github.com/aurabx/runbeam-cli/releases/download/v0.3.0/runbeam-macos-aarch64-v0.3.0.tar.gz
shasum -a 256 runbeam-macos-aarch64-v0.3.0.tar.gz

# Extract and install
tar -xzf runbeam-macos-aarch64-v0.3.0.tar.gz
chmod +x runbeam
mv runbeam /usr/local/bin/
```

#### Linux
```bash
# Download and verify
wget https://github.com/aurabx/runbeam-cli/releases/download/v0.3.0/runbeam-linux-x86_64-v0.3.0.tar.gz
sha256sum runbeam-linux-x86_64-v0.3.0.tar.gz

# Extract and install
tar -xzf runbeam-linux-x86_64-v0.3.0.tar.gz
chmod +x runbeam
sudo mv runbeam /usr/local/bin/
```

#### Windows
```powershell
# Download and verify
Invoke-WebRequest -Uri https://github.com/aurabx/runbeam-cli/releases/download/v0.3.0/runbeam-windows-x86_64-v0.3.0.zip -OutFile runbeam.zip
certutil -hashfile runbeam.zip SHA256

# Extract
Expand-Archive .\runbeam.zip -DestinationPath .

# Add to PATH or move to a directory on PATH
```

### Install from Crates.io

```bash
cargo install runbeam-cli
```

### Install from Source

```bash
# Clone and build
git clone https://github.com/aurabx/runbeam-cli.git
cd runbeam-cli
cargo install --path .
```

## Quick Start

```bash
# List available commands
runbeam list

# Authenticate with Runbeam (opens browser)
runbeam login

# Add a Harmony instance
runbeam harmony:add -i 127.0.0.1 -p 8081 -x admin -l my-harmony

# Authorize the instance
runbeam harmony:authorize -l my-harmony

# Query instance info
runbeam harmony:info -l my-harmony

# List all instances
runbeam harmony:list

# Logout when done
runbeam logout
```

## Next Steps

- [Harmony Proxy →](/harmony) - Learn about Harmony Proxy
- [Runbeam Cloud →](/runbeam) - Explore Runbeam Cloud
