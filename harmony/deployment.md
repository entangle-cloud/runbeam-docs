---
sidebar_position: 6
---

# Deployment

Deploy Harmony Proxy to production environments with confidence.

## Deployment Options

### Docker (Recommended)

The easiest way to deploy Harmony in production:

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
      - harmony-data:/data
    environment:
      - RUST_LOG=info
      - RUNBEAM_ENCRYPTION_KEY=${RUNBEAM_ENCRYPTION_KEY}
      - RUNBEAM_MACHINE_TOKEN=${RUNBEAM_MACHINE_TOKEN}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9090/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  harmony-data:
```

Start the service:

```bash
docker compose up -d
```

### Kubernetes

Deploy with Kubernetes for high availability:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: harmony-proxy
spec:
  replicas: 3
  selector:
    matchLabels:
      app: harmony-proxy
  template:
    metadata:
      labels:
        app: harmony-proxy
    spec:
      containers:
      - name: harmony
        image: ghcr.io/aurabx/harmony:latest
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9090
          name: management
        env:
        - name: RUST_LOG
          value: "info"
        - name: RUNBEAM_ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: harmony-secrets
              key: encryption-key
        volumeMounts:
        - name: config
          mountPath: /etc/harmony
          readOnly: true
        livenessProbe:
          httpGet:
            path: /health
            port: 9090
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 9090
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: config
        configMap:
          name: harmony-config
```

### Systemd Service (Linux)

Run as a system service:

```ini
[Unit]
Description=Harmony Proxy
After=network.target

[Service]
Type=simple
User=harmony
Group=harmony
WorkingDirectory=/opt/harmony
ExecStart=/usr/local/bin/harmony-proxy --config /etc/harmony/config.toml
Restart=always
RestartSec=5

# Environment
Environment=RUST_LOG=info
EnvironmentFile=/etc/harmony/environment

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/harmony

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable harmony
sudo systemctl start harmony
```

## Configuration Management

### Environment Variables

Store secrets in environment variables:

```bash
# /etc/harmony/environment
RUNBEAM_ENCRYPTION_KEY=AGE-SECRET-KEY-...
RUNBEAM_MACHINE_TOKEN='{"machine_token":"mt_..."}'
RUST_LOG=info
```

### Secret Managers

#### AWS Secrets Manager

```bash
# Store encryption key
aws secretsmanager create-secret \
  --name harmony/encryption-key \
  --secret-string "$RUNBEAM_ENCRYPTION_KEY"

# Retrieve in startup script
export RUNBEAM_ENCRYPTION_KEY=$(aws secretsmanager get-secret-value \
  --secret-id harmony/encryption-key \
  --query SecretString \
  --output text)
```

#### HashiCorp Vault

```bash
# Store secret
vault kv put secret/harmony/encryption-key value="$RUNBEAM_ENCRYPTION_KEY"

# Retrieve
export RUNBEAM_ENCRYPTION_KEY=$(vault kv get -field=value secret/harmony/encryption-key)
```

#### Azure Key Vault

```bash
# Store secret
az keyvault secret set \
  --vault-name harmony-vault \
  --name encryption-key \
  --value "$RUNBEAM_ENCRYPTION_KEY"

# Retrieve
export RUNBEAM_ENCRYPTION_KEY=$(az keyvault secret show \
  --vault-name harmony-vault \
  --name encryption-key \
  --query value -o tsv)
```

## Scaling

### Horizontal Scaling

Harmony is stateless and scales horizontally:

```yaml
# docker-compose.yml
services:
  harmony:
    image: ghcr.io/aurabx/harmony:latest
    deploy:
      replicas: 5
```

### Load Balancing

Use a load balancer in front of Harmony instances:

#### Nginx

```nginx
upstream harmony_backend {
    least_conn;
    server harmony1:8080;
    server harmony2:8080;
    server harmony3:8080;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://harmony_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Monitoring

### Health Checks

Harmony provides a health endpoint:

```bash
curl http://localhost:9090/health
```

### Logging

Configure structured logging:

```bash
# Development
export RUST_LOG=debug

# Production
export RUST_LOG=info,harmony=debug

# Specific modules
export RUST_LOG=harmony::middleware=debug,harmony::backend=info
```

### Metrics

Harmony logs metrics in structured format:

- Request count
- Response times
- Error rates
- Backend health

Integrate with your monitoring stack (Prometheus, Datadog, etc.).

## Security Hardening

### Network Security

- **Use HTTPS**: Always encrypt traffic in production
- **Firewall**: Restrict management API (port 9090) to internal network
- **VPC**: Deploy within a private network

### TLS/SSL

Use a reverse proxy for TLS termination:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - harmony

  harmony:
    image: ghcr.io/aurabx/harmony:latest
    expose:
      - "8080"
```

### File Permissions

```bash
# Configuration files
chmod 600 /etc/harmony/config.toml
chown harmony:harmony /etc/harmony/config.toml

# Data directory
chmod 700 /var/harmony
chown harmony:harmony /var/harmony
```

## Backup and Recovery

### Configuration Backup

```bash
# Backup configuration
tar -czf harmony-config-$(date +%Y%m%d).tar.gz /etc/harmony/

# Store in S3
aws s3 cp harmony-config-*.tar.gz s3://my-backups/harmony/
```

### State Recovery

Harmony is stateless, but machine tokens should be backed up:

```bash
# Backup tokens
cp ~/.runbeam/*/auth.json /secure/backup/location/

# Restore
cp /secure/backup/location/auth.json ~/.runbeam/instance-id/
```

## Production Checklist

- [ ] Use Docker or Kubernetes for deployment
- [ ] Configure HTTPS/TLS with valid certificates
- [ ] Store secrets in secret manager (not environment files)
- [ ] Enable structured logging
- [ ] Set up health check monitoring
- [ ] Configure automatic restarts
- [ ] Implement load balancing for multiple instances
- [ ] Restrict management API access to internal network
- [ ] Set up log aggregation
- [ ] Configure backup for configuration files
- [ ] Test failover and recovery procedures
- [ ] Set up alerts for token expiry (25 days)
- [ ] Document deployment procedures

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker logs harmony
docker compose logs -f harmony
```

### High Memory Usage

Monitor resource usage:
```bash
docker stats harmony
```

Adjust container limits:
```yaml
services:
  harmony:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Connection Issues

Verify networking:
```bash
# Check port bindings
netstat -tlnp | grep harmony

# Test connectivity
curl -v http://localhost:8080/health
```

## Next Steps

- [Configuration overview →](./configuration/)
- [View production examples →](https://github.com/aurabx/harmony/tree/main/examples)
