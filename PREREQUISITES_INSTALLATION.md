# Prerequisites Installation Guide

This guide provides detailed instructions for installing all the prerequisites needed for the GigGatek deployment modernization project. These instructions cover Windows, macOS, and Linux operating systems.

## Table of Contents

1. [Docker and Docker Compose](#docker-and-docker-compose)
2. [Git](#git)
3. [Terraform](#terraform)
4. [Ansible](#ansible)
5. [AWS CLI](#aws-cli)
6. [GitHub CLI](#github-cli)
7. [Verifying Installations](#verifying-installations)

## Docker and Docker Compose

Docker enables containerization of applications, while Docker Compose allows you to define and run multi-container Docker applications.

### Windows

1. **Docker Desktop for Windows**:
   - Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
   - Docker Compose is included with Docker Desktop
   - Ensure your system meets the requirements:
     - Windows 10 64-bit: Pro, Enterprise, or Education (Build 16299 or later)
     - WSL 2 feature enabled
     - Hardware virtualization support

2. **Installation Steps**:
   - Run the installer and follow the prompts
   - During installation, select the option to use WSL 2 backend
   - After installation, start Docker Desktop from the Start menu
   - Wait for Docker to start (indicated by the whale icon in the system tray)

### macOS

1. **Docker Desktop for Mac**:
   - Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
   - Docker Compose is included with Docker Desktop
   - Requirements:
     - macOS 10.14 or newer
     - Apple silicon or Intel chip

2. **Installation Steps**:
   - Open the downloaded .dmg file
   - Drag Docker.app to your Applications folder
   - Launch Docker from Applications
   - You may need to authorize the application to run
   - Wait for Docker to start (indicated by the whale icon in the menu bar)

### Linux (Ubuntu/Debian)

1. **Install Docker Engine**:
   ```bash
   # Update package index
   sudo apt-get update

   # Install dependencies
   sudo apt-get install -y \
       apt-transport-https \
       ca-certificates \
       curl \
       gnupg \
       lsb-release

   # Add Docker's official GPG key
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

   # Set up the stable repository
   echo \
     "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   # Install Docker Engine
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io

   # Add your user to the docker group to run Docker without sudo
   sudo usermod -aG docker $USER
   # Note: You'll need to log out and back in for this to take effect
   ```

2. **Install Docker Compose**:
   ```bash
   # Download the current stable release
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.17.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

   # Apply executable permissions
   sudo chmod +x /usr/local/bin/docker-compose
   ```

## Git

Git is a distributed version control system for tracking changes in source code.

### Windows

1. **Download and Install**:
   - Download [Git for Windows](https://git-scm.com/download/win)
   - Run the installer and follow the prompts
   - Recommended settings:
     - Use Git from the Windows Command Prompt
     - Use OpenSSL library
     - Checkout as-is, commit Unix-style line endings
     - Use Windows' default console window
     - Enable Git Credential Manager

### macOS

1. **Using Homebrew** (recommended):
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Install Git
   brew install git
   ```

2. **Alternative**: Download the [Git for Mac installer](https://git-scm.com/download/mac)

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y git
```

## Terraform

Terraform is an infrastructure as code tool that enables you to safely and predictably create, change, and improve infrastructure.

### Windows

1. **Download and Install**:
   - Download the [Terraform Windows 64-bit](https://www.terraform.io/downloads.html) zip file
   - Extract the zip file to a directory, e.g., `C:\terraform`
   - Add the directory to your system PATH:
     - Open Start Menu and search for "Environment Variables"
     - Click "Edit the system environment variables"
     - Click "Environment Variables"
     - Under "System variables", find "Path", select it and click "Edit"
     - Click "New" and add the path to the directory (e.g., `C:\terraform`)
     - Click "OK" on all dialogs

### macOS

1. **Using Homebrew**:
   ```bash
   brew tap hashicorp/tap
   brew install hashicorp/tap/terraform
   ```

### Linux (Ubuntu/Debian)

```bash
# Add HashiCorp GPG key
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

# Add HashiCorp repository
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list

# Update and install
sudo apt-get update
sudo apt-get install -y terraform
```

## Ansible

Ansible is an open-source software provisioning, configuration management, and application-deployment tool.

### Windows

Ansible doesn't run natively on Windows. There are two options:

1. **Using WSL (Windows Subsystem for Linux)**:
   - Enable WSL and install a Linux distribution
   - Follow the Linux installation instructions inside WSL

2. **Using Docker**:
   - Use an Ansible container with volumes mapped to your project

### macOS

1. **Using Homebrew**:
   ```bash
   brew install ansible
   ```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt-get install -y ansible
```

## AWS CLI

The AWS Command Line Interface is a unified tool to manage your AWS services.

### Windows

1. **Download and Install**:
   - Download the [AWS CLI MSI installer](https://awscli.amazonaws.com/AWSCLIV2.msi)
   - Run the downloaded MSI installer and follow the prompts

### macOS

1. **Using Homebrew**:
   ```bash
   brew install awscli
   ```

2. **Alternative**:
   ```bash
   curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
   sudo installer -pkg AWSCLIV2.pkg -target /
   ```

### Linux (Ubuntu/Debian)

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## GitHub CLI

GitHub CLI is a command-line tool that brings pull requests, issues, and other GitHub concepts to the terminal.

### Windows

1. **Using WinGet**:
   ```
   winget install --id GitHub.cli
   ```

2. **Alternative**: Download the [installer from GitHub](https://github.com/cli/cli/releases/latest)

### macOS

1. **Using Homebrew**:
   ```bash
   brew install gh
   ```

### Linux (Ubuntu/Debian)

```bash
# Add GitHub CLI repository
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null

# Install
sudo apt-get update
sudo apt-get install -y gh
```

## Verifying Installations

After installing all the required tools, verify your installations by running the following commands:

```bash
# Verify Docker installation
docker --version
docker-compose --version

# Verify Git installation
git --version

# Verify Terraform installation
terraform --version

# Verify Ansible installation (not applicable for Windows unless using WSL)
ansible --version

# Verify AWS CLI installation
aws --version

# Verify GitHub CLI installation
gh --version
```

## Configuring AWS CLI

After installing the AWS CLI, you need to configure it with your AWS credentials:

```bash
aws configure
```

You will be prompted to enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name (e.g., us-west-2)
- Default output format (json is recommended)

## Configuring GitHub CLI

To authenticate with your GitHub account:

```bash
gh auth login
```

Follow the interactive prompts to complete the authentication process.

## Next Steps

Once you have all prerequisites installed, proceed to the [GETTING_STARTED.md](./GETTING_STARTED.md) guide to begin implementing the deployment modernization plan.

If you encounter any issues during installation, consult the official documentation for each tool or reach out to the DevOps team for assistance.
