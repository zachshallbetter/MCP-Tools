# BrowserTools MCP Docker Development Makefile

.PHONY: help build start stop restart shell logs server clean status test build-prod

# Default target
help: ## Show this help message
	@echo "BrowserTools MCP Docker Development Commands"
	@echo "============================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Docker commands
build: ## Build the Docker image
	./docker-dev.sh build

start: ## Start the development environment
	./docker-dev.sh start

stop: ## Stop the development environment
	./docker-dev.sh stop

restart: ## Restart the development environment
	./docker-dev.sh restart

shell: ## Open a shell in the running container
	./docker-dev.sh shell

logs: ## Show container logs
	./docker-dev.sh logs

server: ## Start only the browser-tools-server
	./docker-dev.sh server

clean: ## Clean up containers and images
	./docker-dev.sh clean

status: ## Show status of containers
	./docker-dev.sh status

# Development commands
test: ## Run tests in the container
	docker exec browser-tools-mcp-dev bash -c "cd /app/browser-tools-server && npm test"
	docker exec browser-tools-mcp-dev bash -c "cd /app/browser-tools-mcp && npm test"

build-prod: ## Build production versions
	docker exec browser-tools-mcp-dev bash -c "cd /app/browser-tools-server && npm run build"
	docker exec browser-tools-mcp-dev bash -c "cd /app/browser-tools-mcp && npm run build"

# Utility commands
install-deps: ## Install dependencies in the container
	docker exec browser-tools-mcp-dev bash -c "cd /app/browser-tools-server && npm install"
	docker exec browser-tools-mcp-dev bash -c "cd /app/browser-tools-mcp && npm install"

check-ports: ## Check if required ports are available
	@echo "Checking port availability..."
	@for port in 3025 3026 3027 3028 3029 3030 3031 3032 3033 3034 3035; do \
		if lsof -Pi :$$port -sTCP:LISTEN -t >/dev/null ; then \
			echo "Port $$port is in use"; \
		else \
			echo "Port $$port is available"; \
		fi; \
	done

check-docker: ## Check if Docker is running
	@if docker info > /dev/null 2>&1; then \
		echo "Docker is running"; \
	else \
		echo "Docker is not running. Please start Docker and try again."; \
		exit 1; \
	fi

# Quick setup
setup: check-docker build start ## Complete setup: check Docker, build, and start
	@echo "Setup complete! Run 'make shell' to access the container."

# Development workflow
dev: start shell ## Start environment and open shell for development

# Production build
prod: build-prod ## Build production versions of both projects

# Full cleanup
full-clean: clean ## Full cleanup including Docker system prune
	docker system prune -f
	docker volume prune -f

# Health check
health: ## Check the health of running services
	@echo "Checking service health..."
	@if docker ps | grep -q browser-tools-mcp-dev; then \
		echo "Container is running"; \
		curl -s http://localhost:3025/.identity || echo "Server not responding"; \
	else \
		echo "Container is not running"; \
	fi
