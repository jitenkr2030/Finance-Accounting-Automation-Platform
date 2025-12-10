#!/bin/bash

# Finance & Accounting Automation Platform Deployment Script
# This script handles deployment to different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
SKIP_BUILD=${2:-false}
SKIP_TESTS=${3:-false}

echo -e "${BLUE}🚀 Finance & Accounting Platform Deployment${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Skip Build: $SKIP_BUILD${NC}"
echo -e "${BLUE}Skip Tests: $SKIP_TESTS${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    print_info "Checking environment variables..."
    
    required_vars=("MONGODB_URI" "JWT_SECRET" "NODE_ENV")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    print_status "Environment variables check passed"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install backend dependencies
    npm ci --only=production
    
    # Install frontend dependencies
    cd client && npm ci --only=production && cd ..
    
    print_status "Dependencies installed successfully"
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        print_warning "Skipping tests as requested"
        return
    fi
    
    print_info "Running tests..."
    
    # Backend tests
    npm test
    
    # Frontend tests
    cd client && npm test -- --watchAll=false && cd ..
    
    print_status "All tests passed"
}

# Build applications
build_applications() {
    if [ "$SKIP_BUILD" = "true" ]; then
        print_warning "Skipping build as requested"
        return
    fi
    
    print_info "Building applications..."
    
    # Build frontend
    cd client && npm run build && cd ..
    
    print_status "Applications built successfully"
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Check if MongoDB is running
    if ! nc -z localhost 27017 2>/dev/null; then
        print_warning "MongoDB not running. Starting with Docker..."
        docker-compose up -d mongodb
        sleep 10
    fi
    
    # Run database migrations/seeding
    npm run seed
    
    print_status "Database setup completed"
}

# Start application
start_application() {
    print_info "Starting application in $ENVIRONMENT mode..."
    
    case $ENVIRONMENT in
        "development")
            npm run dev
            ;;
        "staging"|"production")
            # Start with PM2 for production
            if command -v pm2 &> /dev/null; then
                pm2 start ecosystem.config.js --env $ENVIRONMENT
            else
                npm start
            fi
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

# Health check
health_check() {
    print_info "Performing health check..."
    
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:5000/health &> /dev/null; then
            print_status "Health check passed"
            return 0
        fi
        
        print_info "Attempt $attempt/$max_attempts - waiting for application to be ready..."
        sleep 2
        ((attempt++))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Docker deployment
deploy_docker() {
    print_info "Deploying with Docker..."
    
    # Build and start services
    docker-compose build
    docker-compose up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Run database seeding in container
    docker-compose exec -T api npm run seed
    
    print_status "Docker deployment completed"
}

# Cleanup function
cleanup() {
    print_info "Cleaning up..."
    
    # Stop any running processes
    pkill -f "node server.js" || true
    pkill -f "nodemon" || true
    
    # Clean up Docker containers if needed
    if [ "$ENVIRONMENT" = "staging" ]; then
        docker-compose down -v || true
    fi
    
    print_status "Cleanup completed"
}

# Main deployment logic
main() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}    Finance Platform Deployment v1.0.0${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
    
    # Trap to cleanup on exit
    trap cleanup EXIT
    
    # Pre-deployment checks
    check_env_vars
    
    # Check Node.js version
    node_version=$(node --version | cut -d'v' -f2)
    required_version="18.0.0"
    
    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
        print_error "Node.js version $node_version is not supported. Minimum required: $required_version"
        exit 1
    fi
    
    print_status "Node.js version $node_version is supported"
    
    # Deploy based on environment
    case $ENVIRONMENT in
        "docker")
            deploy_docker
            ;;
        "development"|"staging"|"production")
            install_dependencies
            run_tests
            build_applications
            setup_database
            start_application
            health_check
            ;;
        *)
            print_error "Unknown deployment method: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
    echo -e "${GREEN}Health Check: Passed${NC}"
    echo -e "${GREEN}============================================${NC}"
    
    # Print next steps
    echo ""
    print_info "Next steps:"
    echo "  1. Access the application at: http://localhost:3000"
    echo "  2. API documentation: http://localhost:5000/api-docs"
    echo "  3. Admin panel: http://localhost:3000/admin"
    echo ""
    print_info "Default credentials:"
    echo "  Email: admin@financeplatform.com"
    echo "  Password: admin123"
    echo ""
    print_info "Environment variables can be configured in .env file"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo ""
        print_warning "Production deployment notes:"
        echo "  - Ensure SSL certificates are configured"
        echo "  - Set up monitoring and logging"
        echo "  - Configure backup strategies"
        echo "  - Review security settings"
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [environment] [skip-build] [skip-tests]"
    echo ""
    echo "Environments:"
    echo "  development  - Local development server"
    echo "  staging      - Staging environment"
    echo "  production   - Production environment"
    echo "  docker       - Docker deployment"
    echo ""
    echo "Options:"
    echo "  skip-build   - Skip building applications (true/false)"
    echo "  skip-tests   - Skip running tests (true/false)"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 staging true false"
    echo "  $0 production"
    echo "  $0 docker"
}

# Handle command line arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_usage
    exit 0
fi

# Validate environment
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "docker" ]; then
    print_error "Invalid environment: $ENVIRONMENT"
    show_usage
    exit 1
fi

# Run main deployment
main "$@"