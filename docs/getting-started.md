---
sidebar_position: 1
---

# Getting Started

This guide will walk you through setting up the Runbeam CLI, installing Harmony, and deploying your first configuration.

## Prerequisites

- macOS, Linux, or Windows operating system
- Internet connection
- A modern web browser for authentication

## Step 1: Create a Runbeam Account

Before using the CLI, you'll need a Runbeam account:

1. Visit [runbeam.io](https://runbeam.io) and click **Sign Up**
2. Complete the registration process
3. Verify your email address
4. Log in to the Runbeam dashboard

## Step 2: Install the CLI

The quickest way to install the Runbeam CLI is using the automated installation script.

### macOS and Linux

Open your terminal and run:

```bash
# Using curl
curl -fsSL https://raw.githubusercontent.com/aurabx/runbeam-cli/main/install.sh | bash
```

Or with wget:

```bash
# Using wget
wget -qO- https://raw.githubusercontent.com/aurabx/runbeam-cli/main/install.sh | bash
```

The script will:
- Detect your platform and architecture automatically
- Download the latest release
- Verify checksums
- Install to `~/.local/bin`, `/usr/local/bin`, or `~/bin`
- Provide PATH configuration guidance if needed

### Windows

Download the latest release from [GitHub Releases](https://github.com/aurabx/runbeam-cli/releases):

1. Download the Windows `.zip` file
2. Extract the archive
3. Move `runbeam.exe` to a folder on your PATH

### Verify Installation

Confirm the CLI is installed correctly:

```bash
runbeam --version
```

You should see the version number displayed.

## Step 3: Authenticate with Runbeam

Log in to your Runbeam account through the CLI:

```bash
runbeam login
```

This will:
1. Open your default web browser
2. Prompt you to log in to Runbeam
3. Request authorization for the CLI
4. Save your authentication token securely

Once complete, you'll see a success message in your terminal.

### Verify Authentication

Confirm your authentication is working:

```bash
runbeam verify
```

This displays your token information, expiry date, and user details.

## Step 4: Install Harmony

Harmony is the proxy server that routes traffic to your services. Install it using the CLI:

```bash
runbeam harmony:install
```

The CLI will:
- Detect your operating system and architecture
- Download the latest Harmony release
- Install it to the appropriate location:
  - **macOS/Linux**: `~/.local/bin`
  - **Windows**: `%APPDATA%\runbeam\bin`
- Set executable permissions (Unix systems)

### Verify Harmony Installation

Check that Harmony is installed:

```bash
harmony --version
```

## Step 5: Configure Harmony

Before starting Harmony, you need a configuration file. Create a basic `config.toml`:

```toml
# Basic Harmony configuration
[server]
host = "0.0.0.0"
port = 8080

[management]
enabled = true
host = "127.0.0.1"
port = 8081
path_prefix = "admin"

[runbeam]
enabled = true

[[pipelines]]
name = "example"
match_path = "/"
```

Save this as `config.toml` in your working directory.

### Start Harmony

Run Harmony with your configuration:

```bash
harmony -c config.toml
```

Harmony will start and listen on:
- **Port 8080**: Main proxy traffic
- **Port 8081**: Management API

## Step 6: Register Harmony with the CLI

Add your running Harmony instance to the CLI:

```bash
runbeam harmony:add \
  -i 127.0.0.1 \
  -p 8081 \
  -x admin \
  -l my-harmony
```

This registers the instance locally with the label `my-harmony`.

### Verify Registration

List your registered Harmony instances:

```bash
runbeam harmony:list
```

You should see your instance in the list.

## Step 7: Authorize Harmony with Runbeam Cloud

Authorize your Harmony instance to communicate with Runbeam Cloud:

```bash
runbeam harmony:authorize -l my-harmony
```

This process:
1. Exchanges your user token for a machine token
2. Sends the machine token to Harmony
3. Enables Harmony to sync with Runbeam Cloud
4. **Automatically uploads your local configuration** to Runbeam Cloud

You should see a success message indicating the authorization is complete.

:::note
The authorization command automatically runs `harmony:update` to upload your local configuration. You don't need to run it separately unless you want to update the configuration later.
:::

### Optional: Manual Configuration Upload

If you make changes to your local Harmony configuration later, you can manually upload it:

```bash
runbeam harmony:update -l my-harmony
```

:::warning
Running `harmony:update` will overwrite any pipelines you've created in the Runbeam dashboard with your local configuration. Only use this if you want your local config to be the source of truth.
:::

## Step 8: Create a Pipeline in Runbeam Cloud

Now let's create a pipeline in the Runbeam dashboard:

1. Log in to the [Runbeam dashboard](https://runbeam.io)
2. Navigate to **Pipelines**
3. Click **Create Pipeline**
4. Configure your pipeline:
   - **Name**: `my-first-pipeline`
   - **Match Path**: `/api/*`
   - **Target**: Your backend service URL (e.g., `http://localhost:3000`)
5. Add any desired middleware (rate limiting, authentication, etc.)
6. Click **Save**

The pipeline is now active and will route matching requests through Harmony.

### Sync Cloud Configuration to Harmony

If you've made changes in the Runbeam dashboard (like creating pipelines) and want to pull them to your local Harmony instance:

1. Export the configuration from the dashboard
2. Update your local `config.toml`
3. Reload Harmony:
   ```bash
   runbeam harmony:reload -l my-harmony
   ```

## Step 9: Test Your Setup

Test that everything is working:

```bash
# Check instance info
runbeam harmony:info -l my-harmony

# View configured pipelines
runbeam harmony:pipelines -l my-harmony

# View routes
runbeam harmony:routes -l my-harmony
```

### Send a Test Request

With Harmony running, send a test request through your proxy:

```bash
curl http://localhost:8080/api/test
```

If configured correctly, Harmony will route the request according to your pipeline rules.

## Next Steps

Congratulations! You've successfully set up the Runbeam CLI, installed Harmony, and deployed your first configuration. Here are some next steps:

- **[CLI Commands Reference](/cli/commands)** - Explore all available CLI commands
- **[Authorization Guide](/cli/authorization)** - Learn more about the authorization process
- **[Harmony Documentation](/harmony)** - Deep dive into Harmony configuration
- **[Runbeam Cloud](/runbeam)** - Explore advanced cloud features

## Common Issues

### PATH Not Configured

If `runbeam` or `harmony` commands aren't found, ensure the installation directory is in your PATH:

```bash
# Add to ~/.bashrc, ~/.zshrc, or equivalent
export PATH="$HOME/.local/bin:$PATH"
```

Then reload your shell configuration:

```bash
source ~/.bashrc  # or ~/.zshrc
```

### Harmony Not Connecting

If Harmony can't connect to the management API:

1. Verify Harmony is running: `ps aux | grep harmony`
2. Check the management port is correct: `8081` by default
3. Ensure `management.enabled = true` in your `config.toml`

### Authorization Failed

If authorization fails:

1. Verify you're logged in: `runbeam verify`
2. Check Harmony has `runbeam.enabled = true` in `config.toml`
3. Ensure the Harmony instance is registered: `runbeam harmony:list`
4. Try logging out and back in: `runbeam logout && runbeam login`

## Getting Help

If you encounter issues:

- Check the [Commands Reference](/cli/commands) for detailed command documentation
- Visit the [Harmony documentation](/harmony) for configuration help
- Increase CLI verbosity for debugging: `runbeam -vv <command>`
- Check Harmony logs for error messages
