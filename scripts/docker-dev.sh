#!/bin/bash

# BrowserTools MCP Docker Development Script
# This script provides easy commands to work with the Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "BrowserTools MCP Docker Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build          Build the Docker image"
    echo "  start          Start the development environment"
    echo "  stop           Stop the development environment"
    echo "  restart        Restart the development environment"
    echo "  shell          Open a shell in the running container"
    echo "  logs           Show container logs"
    echo "  server         Start only the browser-tools-server"
    echo "  clean          Clean up containers and images"
    echo "  status         Show status of containers"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build       # Build the Docker image"
    echo "  $0 start       # Start the development environment"
    echo "  $0 shell       # Open a shell in the container"
    echo "  $0 server      # Start only the server for development"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build the Docker image
build_image() {
    print_status "Building BrowserTools MCP Docker image..."
    docker-compose build
    print_success "Docker image built successfully!"
}

# Function to start the development environment
start_dev() {
    print_status "Starting BrowserTools MCP development environment..."
    
    # Create downloads directory if it doesn't exist
    mkdir -p downloads
    
    docker-compose up -d browser-tools-dev
    print_success "Development environment started!"
    print_status "Container name: browser-tools-mcp-dev"
    print_status "Available ports: 3025-3035"
    echo ""
    print_status "To open a shell in the container, run: $0 shell"
    print_status "To view logs, run: $0 logs"
}

# Function to stop the development environment
stop_dev() {
    print_status "Stopping BrowserTools MCP development environment..."
    docker-compose down
    print_success "Development environment stopped!"
}

# Function to restart the development environment
restart_dev() {
    print_status "Restarting BrowserTools MCP development environment..."
    docker-compose restart
    print_success "Development environment restarted!"
}

# Function to open a shell in the container
open_shell() {
    print_status "Opening shell in browser-tools-mcp-dev container..."
    docker exec -it browser-tools-mcp-dev bash
}

# Function to show container logs
show_logs() {
    print_status "Showing logs for browser-tools-mcp-dev container..."
    docker-compose logs -f browser-tools-dev
}

# Function to start only the server
start_server() {
    print_status "Starting BrowserTools Server in development mode..."
    
    # Create downloads directory if it doesn't exist
    mkdir -p downloads
    
    docker-compose --profile server-only up -d browser-tools-server-dev
    print_success "BrowserTools Server started!"
    print_status "Server is running on port 3025"
    echo ""
    print_status "To view logs, run: $0 logs"
}

# Function to clean up containers and images
clean_up() {
    print_warning "This will remove all containers and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up containers and images..."
        docker-compose down --rmi all --volumes --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show container status
show_status() {
    print_status "Container status:"
    docker-compose ps
    echo ""
    print_status "Running containers:"
    docker ps --filter "name=browser-tools" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        build)
            build_image
            ;;
        start)
            start_dev
            ;;
        stop)
            stop_dev
            ;;
        restart)
            restart_dev
            ;;
        shell)
            open_shell
            ;;
        logs)
            show_logs
            ;;
        server)
            start_server
            ;;
        clean)
            clean_up
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
