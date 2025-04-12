#!/bin/bash
# GigGatek Infrastructure Prerequisites Installation Script

# Make script exit if any command fails
set -e

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    # Detect distribution
    if [ -f /etc/debian_version ]; then
        DISTRO="debian"
    elif [ -f /etc/redhat-release ]; then
        DISTRO="redhat"
    else
        DISTRO="unknown"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo "Detected OS: $OS"
if [ "$OS" == "linux" ]; then
    echo "Detected distribution: $DISTRO"
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Docker on Linux
install_docker_linux() {
    echo "Installing Docker on Linux..."
    
    if [ "$DISTRO" == "debian" ]; then
        # Update package index
        sudo apt-get update
        
        # Install prerequisites
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
        
        # Add user to the docker group
        sudo usermod -aG docker $USER
        echo "NOTE: You may need to log out and log back in for docker group changes to take effect"
        
        # Install Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.17.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
    elif [ "$DISTRO" == "redhat" ]; then
        # Install prerequisites
        sudo yum install -y yum-utils device-mapper-persistent-data lvm2
        
        # Add Docker repository
        sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        
        # Install Docker Engine
        sudo yum install -y docker-ce docker-ce-cli containerd.io
        
        # Start and enable Docker
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Add user to the docker group
        sudo usermod -aG docker $USER
        echo "NOTE: You may need to log out and log back in for docker group changes to take effect"
        
        # Install Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.17.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        echo "Unsupported Linux distribution. Please install Docker manually."
        exit 1
    fi
}

# Function to install Docker on macOS
install_docker_macos() {
    echo "Installing Docker on macOS..."
    
    if command_exists brew; then
        brew install --cask docker
        echo "Docker Desktop installed. Please start Docker Desktop from your Applications folder."
    else
        echo "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        brew install --cask docker
        echo "Docker Desktop installed. Please start Docker Desktop from your Applications folder."
    fi
}

# Function to install Docker on Windows
install_docker_windows() {
    echo "Installing Docker on Windows..."
    
    if command_exists winget; then
        winget install -e --id Docker.DockerDesktop
        echo "Docker Desktop installed. Please start Docker Desktop from the Start menu."
    else
        echo "Please download and install Docker Desktop manually from: https://www.docker.com/products/docker-desktop"
    fi
}

# Function to install Terraform
install_terraform() {
    echo "Installing Terraform..."
    
    if [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "debian" ]; then
            # Add HashiCorp GPG key
            wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
            
            # Add HashiCorp repository
            echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
            
            # Update and install
            sudo apt-get update
            sudo apt-get install -y terraform
        elif [ "$DISTRO" == "redhat" ]; then
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
            sudo yum -y install terraform
        else
            echo "Unsupported Linux distribution. Please install Terraform manually."
        fi
    elif [ "$OS" == "macos" ]; then
        if command_exists brew; then
            brew tap hashicorp/tap
            brew install hashicorp/tap/terraform
        else
            echo "Homebrew not found. Please install Terraform manually."
        fi
    elif [ "$OS" == "windows" ]; then
        if command_exists winget; then
            winget install -e --id Hashicorp.Terraform
        else
            echo "Please download and install Terraform manually from: https://www.terraform.io/downloads.html"
        fi
    else
        echo "Unsupported OS. Please install Terraform manually."
    fi
}

# Function to install Ansible
install_ansible() {
    echo "Installing Ansible..."
    
    if [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "debian" ]; then
            sudo apt-get update
            sudo apt-get install -y software-properties-common
            sudo add-apt-repository --yes --update ppa:ansible/ansible
            sudo apt-get install -y ansible
        elif [ "$DISTRO" == "redhat" ]; then
            sudo yum install -y epel-release
            sudo yum install -y ansible
        else
            echo "Unsupported Linux distribution. Please install Ansible manually."
        fi
    elif [ "$OS" == "macos" ]; then
        if command_exists brew; then
            brew install ansible
        else
            echo "Homebrew not found. Please install Ansible manually."
        fi
    elif [ "$OS" == "windows" ]; then
        echo "Ansible doesn't run natively on Windows. Consider using WSL (Windows Subsystem for Linux)."
        echo "Or you can use Docker for running Ansible. For example:"
        echo "docker run --rm -it -v ${PWD}:/ansible -w /ansible cytopia/ansible ansible-playbook playbook.yml"
    else
        echo "Unsupported OS. Please install Ansible manually."
    fi
}

# Function to install AWS CLI
install_aws_cli() {
    echo "Installing AWS CLI..."
    
    if [ "$OS" == "linux" ]; then
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip -q awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    elif [ "$OS" == "macos" ]; then
        if command_exists brew; then
            brew install awscli
        else
            curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
            sudo installer -pkg AWSCLIV2.pkg -target /
            rm AWSCLIV2.pkg
        fi
    elif [ "$OS" == "windows" ]; then
        if command_exists winget; then
            winget install -e --id Amazon.AWSCLI
        else
            echo "Please download and install AWS CLI manually from: https://aws.amazon.com/cli/"
        fi
    else
        echo "Unsupported OS. Please install AWS CLI manually."
    fi
}

# Function to install Redis
install_redis() {
    echo "Installing Redis..."
    
    if [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "debian" ]; then
            sudo apt-get update
            sudo apt-get install -y redis-server
            # Enable Redis to start on boot
            sudo systemctl enable redis-server
            # Start Redis service
            sudo systemctl start redis-server
        elif [ "$DISTRO" == "redhat" ]; then
            sudo yum install -y redis
            # Enable Redis to start on boot
            sudo systemctl enable redis
            # Start Redis service
            sudo systemctl start redis
        else
            echo "Unsupported Linux distribution. Please install Redis manually."
        fi
    elif [ "$OS" == "macos" ]; then
        if command_exists brew; then
            brew install redis
            # Start Redis service
            brew services start redis
        else
            echo "Homebrew not found. Please install Redis manually."
        fi
    elif [ "$OS" == "windows" ]; then
        echo "Redis doesn't run natively on Windows. Consider using WSL (Windows Subsystem for Linux)."
        echo "Or you can use the Redis Docker image (which is what our docker-compose.yml uses)."
        echo "docker run --name redis -p 6379:6379 -d redis:7-alpine"
    else
        echo "Unsupported OS. Please install Redis manually."
    fi
}

# Function to install GitHub CLI
install_github_cli() {
    echo "Installing GitHub CLI..."
    
    if [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "debian" ]; then
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y gh
        elif [ "$DISTRO" == "redhat" ]; then
            sudo dnf install -y 'dnf-command(config-manager)'
            sudo dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
            sudo dnf install -y gh
        else
            echo "Unsupported Linux distribution. Please install GitHub CLI manually."
        fi
    elif [ "$OS" == "macos" ]; then
        if command_exists brew; then
            brew install gh
        else
            echo "Homebrew not found. Please install GitHub CLI manually."
        fi
    elif [ "$OS" == "windows" ]; then
        if command_exists winget; then
            winget install -e --id GitHub.cli
        else
            echo "Please download and install GitHub CLI manually from: https://github.com/cli/cli/releases"
        fi
    else
        echo "Unsupported OS. Please install GitHub CLI manually."
    fi
}

# Function to create project directories if they don't exist
create_directories() {
    echo "Creating project directories..."
    
    # Create directories for logs and data
    mkdir -p logs/backend logs/mysql monitoring/grafana/provisioning/dashboards/json
}

# Install Docker based on OS
if ! command_exists docker; then
    if [ "$OS" == "linux" ]; then
        install_docker_linux
    elif [ "$OS" == "macos" ]; then
        install_docker_macos
    elif [ "$OS" == "windows" ]; then
        install_docker_windows
    else
        echo "Unsupported OS. Please install Docker manually."
    fi
else
    echo "Docker is already installed."
fi

# Install Docker Compose if necessary
if ! command_exists docker-compose; then
    if [ "$OS" == "linux" ]; then
        echo "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.17.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        echo "Docker Compose should be included with Docker Desktop for macOS/Windows."
    fi
else
    echo "Docker Compose is already installed."
fi

# Install Terraform
if ! command_exists terraform; then
    install_terraform
else
    echo "Terraform is already installed."
fi

# Install Ansible
if ! command_exists ansible; then
    install_ansible
else
    echo "Ansible is already installed."
fi

# Install AWS CLI
if ! command_exists aws; then
    install_aws_cli
else
    echo "AWS CLI is already installed."
fi

# Install GitHub CLI
if ! command_exists gh; then
    install_github_cli
else
    echo "GitHub CLI is already installed."
fi

# Install Redis
if ! command_exists redis-server && ! command_exists redis-cli; then
    install_redis
else
    echo "Redis is already installed."
fi

# Create project directories
create_directories

echo ""
echo "==============================================="
echo "Installation complete! Next steps:"
echo "1. Run 'make dev' to start the development environment"
echo "2. Run 'make monitoring' to start the monitoring stack"
echo "3. Run 'make elk' to start the ELK stack"
echo "==============================================="
