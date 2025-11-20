---
sidebar_position: 1
---

# Welcome to Runbeam

Runbeam is a comprehensive platform for building secure, scalable data integration systems with first-class healthcare support.

## The Runbeam Ecosystem

The Runbeam platform consists of four key components:

### Runbeam Cloud

**Centralized management platform** for your data integration infrastructure.

- Manage gateways, services, and endpoints from a single control plane
- Team collaboration and access control
- API access for programmatic configuration
- Monitor and track your integration health

[Learn more about Runbeam Cloud →](/runbeam)

### Harmony Proxy

**Production-ready data mesh proxy** for heterogeneous systems.

- Multi-protocol support: HTTP/JSON, FHIR, DICOM/DICOMweb, JMIX
- Configurable pipelines with ordered middleware
- Hot configuration reload for zero-downtime updates
- Secure authentication with JWT and machine tokens
- JSON transformations (JOLT) and protocol bridging

[Get started with Harmony →](/harmony)

### Runbeam CLI

**Command-line tool** for managing Harmony instances and Runbeam Cloud.

- Browser-based OAuth authentication
- Add and manage Harmony instances
- Authorize gateways with secure token management
- Query instance configuration and health
- Built-in encryption key management

[Install the CLI →](/cli)

### Runbeam SDK

**Rust library** for integrating with the Runbeam Cloud API.

- Dual authentication: JWT tokens and Laravel Sanctum
- Comprehensive API client for gateway and service management
- Secure token storage with OS keychain integration
- Machine token handling for autonomous authentication
- Cross-platform: macOS, Linux, and Windows

[Explore the SDK →](/sdk)

## How It Works

The Runbeam ecosystem connects cloud management with edge data processing:

1. **Configure** your data integration in Runbeam Cloud
2. **Deploy** Harmony Proxy instances at your data sources
3. **Authorize** gateways using the CLI or SDK
4. **Process** data through configurable pipelines with zero-downtime updates

## Key Features

- 🔒 **Secure by Default** - JWT authentication, encrypted token storage, machine-scoped credentials
- 🏥 **Healthcare First** - Native FHIR, DICOM/DICOMweb, and JMIX support
- 🔄 **Hot Reload** - Update configuration without restarting services
- 🎯 **Protocol Agnostic** - Bridge between HTTP/JSON, FHIR, DICOM, and custom protocols
- 🚀 **Production Ready** - Structured logging, robust error handling, battle-tested
- 🔧 **Extensible** - Plugin architecture for custom middleware and backends

## Next Steps

<div className="row">
  <div className="col col--6">
    <h3>New to Runbeam?</h3>
    <ul>
      <li><a href="/runbeam">Explore Runbeam Cloud</a></li>
      <li><a href="/harmony/quickstart">Deploy your first Harmony instance</a></li>
      <li><a href="/docs/concepts/authentication">Understand authentication</a></li>
    </ul>
  </div>
  <div className="col col--6">
    <h3>Ready to Integrate?</h3>
    <ul>
      <li><a href="/cli">Install the CLI</a></li>
      <li><a href="/sdk">Add the SDK to your project</a></li>
      <li><a href="/harmony/quickstart">Configure Harmony</a></li>
    </ul>
  </div>
</div>

## Support

- **General Questions**: hello@aurabox.cloud
- **GitHub**: [github.com/aurabx/harmony](https://github.com/aurabx/harmony)
- **Website**: [harmonyproxy.com](https://harmonyproxy.com)
