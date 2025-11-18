---
sidebar_position: 3
---

# Installation

Detailed installation instructions for Harmony Proxy.

## System Requirements

### Runtime Environment
- **Operating System**: macOS, Linux, or Windows
- **Architecture**: x86_64 or ARM64 (Apple Silicon)

### For DICOM DIMSE Features
If you plan to use DICOM DIMSE operations (SCU/SCP), install DCMTK: [https://dicom.offis.de/dcmtk.php.en](https://dicom.offis.de/dcmtk.php.en)

## Installation Methods

### Pre-built Binaries (Recommended)

The fastest way to get started is with pre-built binaries for your platform. Download the latest release from [GitHub Releases](https://github.com/aurabx/harmony/releases/latest).

#### Linux (x86_64)

```bash
# Download the latest release
wget https://github.com/aurabx/harmony/releases/latest/download/harmony-x86_64-unknown-linux-gnu.tar.gz

# Download and verify SHA256 checksum
wget https://github.com/aurabx/harmony/releases/latest/download/harmony-x86_64-unknown-linux-gnu.sha256
sha256sum -c harmony-x86_64-unknown-linux-gnu.sha256

# Extract the archive
tar xzf harmony-x86_64-unknown-linux-gnu.tar.gz

# Make executable
chmod +x harmony

# Optional: Move to system path
sudo mv harmony /usr/local/bin/
```

#### Linux (ARM64)

```bash
# Download the latest release
wget https://github.com/aurabx/harmony/releases/latest/download/harmony-aarch64-unknown-linux-gnu.tar.gz

# Download and verify SHA256 checksum
wget https://github.com/aurabx/harmony/releases/latest/download/harmony-aarch64-unknown-linux-gnu.sha256
sha256sum -c harmony-aarch64-unknown-linux-gnu.sha256

# Extract the archive
tar xzf harmony-aarch64-unknown-linux-gnu.tar.gz

# Make executable
chmod +x harmony

# Optional: Move to system path
sudo mv harmony /usr/local/bin/
```

#### Windows (x64)

```powershell
# Download the latest release (using PowerShell)
Invoke-WebRequest -Uri "https://github.com/aurabx/harmony/releases/latest/download/harmony-x86_64-pc-windows-msvc.tar.gz" -OutFile "harmony-x86_64-pc-windows-msvc.tar.gz"

# Download SHA256 checksum
Invoke-WebRequest -Uri "https://github.com/aurabx/harmony/releases/latest/download/harmony-x86_64-pc-windows-msvc.sha256" -OutFile "harmony-x86_64-pc-windows-msvc.sha256"

# Verify checksum
Get-FileHash -Algorithm SHA256 harmony-x86_64-pc-windows-msvc.tar.gz
# Compare the output with the contents of the .sha256 file

# Extract the archive (tar is built into Windows 10+)
tar xzf harmony-x86_64-pc-windows-msvc.tar.gz

# Optional: Add to PATH
# Move harmony.exe to a directory in your PATH, or add the current directory to PATH
```

#### macOS (Apple Silicon)

```bash
# Download the latest release
curl -LO https://github.com/aurabx/harmony/releases/latest/download/harmony-aarch64-apple-darwin.tar.gz

# Download and verify SHA256 checksum
curl -LO https://github.com/aurabx/harmony/releases/latest/download/harmony-aarch64-apple-darwin.sha256
shasum -a 256 -c harmony-aarch64-apple-darwin.sha256

# Extract the archive
tar xzf harmony-aarch64-apple-darwin.tar.gz

# Remove quarantine attribute (required on macOS)
xattr -d com.apple.quarantine harmony

# Make executable (if needed)
chmod +x harmony

# Optional: Move to system path
sudo mv harmony /usr/local/bin/
```

#### macOS (Intel)

```bash
# Download the latest release
curl -LO https://github.com/aurabx/harmony/releases/latest/download/harmony-x86_64-apple-darwin.tar.gz

# Download and verify SHA256 checksum
curl -LO https://github.com/aurabx/harmony/releases/latest/download/harmony-x86_64-apple-darwin.sha256
shasum -a 256 -c harmony-x86_64-apple-darwin.sha256

# Extract the archive
tar xzf harmony-x86_64-apple-darwin.tar.gz

# Remove quarantine attribute (required on macOS)
xattr -d com.apple.quarantine harmony

# Make executable (if needed)
chmod +x harmony

# Optional: Move to system path
sudo mv harmony /usr/local/bin/
```

### Docker

#### Docker Compose

For production deployments with persistent configuration, create a `docker-compose.yml`:

```bash
# Linux
export RUNBEAM_ENCRYPTION_KEY=$(age-keygen | base64 -w 0)

# macOS
export RUNBEAM_ENCRYPTION_KEY=$(age-keygen | base64 | tr -d '\n')

# Windows (PowerShell)
$key = age-keygen | base64
$env:RUNBEAM_ENCRYPTION_KEY = $key
```

```yaml
version: '3.8'

services:
  harmony:
    image: ghcr.io/aurabx/harmony:latest
    ports:
      - "8080:8080"
      - "9090:9090"
    volumes:
      - ./config:/etc/harmony:ro
      - ./data:/data
    environment:
      - RUST_LOG=info
      - RUNBEAM_ENCRYPTION_KEY=${RUNBEAM_ENCRYPTION_KEY}
    restart: unless-stopped
```

If you are not using the Management API, you can omit "9090".

Start the service:

```bash
docker compose up -d
```

#### Published Image

```bash
# Pull the latest image
docker pull ghcr.io/aurabx/harmony:latest

# Run with your configuration
docker run -d \
  -p 8080:8080 \
  -p 9090:9090 \
  -v $(pwd)/config:/etc/harmony:ro \
  -v $(pwd)/data:/data \
  --name harmony \
  ghcr.io/aurabx/harmony:latest
```

### Build from Source

For contributors or custom builds:

#### Prerequisites

- Rust (stable) via [rustup](https://rustup.rs/)
- macOS or Linux

#### Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### Clone and Build

```bash
# Clone the repository
git clone https://github.com/aurabx/harmony.git
cd harmony

# Build release binary
cargo build --release

# The binary will be at target/release/harmony
```

#### Install System-Wide (Optional)

```bash
# Copy to system path
sudo cp target/release/harmony /usr/local/bin/

# Or create a symlink
sudo ln -s $(pwd)/target/release/harmony /usr/local/bin/harmony
```

## Configuration

After installation, you need a configuration file.

### Using Example Configurations

If you cloned the repository:

```bash
# Clone the repository for examples
git clone https://github.com/aurabx/harmony.git
cd harmony

# Use an example configuration directly
harmony --config examples/basic-echo/config.toml
```

Or create your own:

```bash
# Copy an example configuration
cp examples/basic-echo/config.toml my-config.toml

# Edit as needed
nano my-config.toml
```

See the [Configuration Guide](./configuration/) for detailed configuration options.

## Running Harmony

### From Binary

```bash
# If in current directory
./harmony --config /path/to/config.toml

# If installed to /usr/local/bin or in PATH
harmony --config /path/to/config.toml
```

### As a System Service (Linux)

Create `/etc/systemd/system/harmony.service`:

```ini
[Unit]
Description=Harmony Proxy
After=network.target

[Service]
Type=simple
User=harmony
WorkingDirectory=/opt/harmony
ExecStart=/usr/local/bin/harmony --config /etc/harmony/config.toml
Restart=always
RestartSec=5
Environment=RUST_LOG=info

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable harmony
sudo systemctl start harmony
sudo systemctl status harmony
```

## Environment Variables

- `RUNBEAM_ENCRYPTION_KEY` - Encryption key for secure token storage. Will be generated automatically if not provided.
- `RUST_LOG` - Logging level (debug, info, warn, error)
- `RUNBEAM_MACHINE_TOKEN` - Pre-provisioned machine token (JSON format) for connecting to Runbeam
- `RUNBEAM_JWT_SECRET` - Shared secret for JWT validation

See the [Security Guide](./security) for details on generating and managing these values.

## Verification

Test that Harmony is running:

```bash
# Health check (if management API is enabled)
curl http://localhost:9090/health

# Test an endpoint (adjust based on your config)
curl http://localhost:8080/echo
```

## Next Steps

- [Configure Harmony →](./configuration/)
- [Set up authentication →](./configuration/authentication)
- [Deploy to production →](./deployment)
