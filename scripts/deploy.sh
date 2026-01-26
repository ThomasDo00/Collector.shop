#!/bin/bash
set -e

# ===========================================
# Collector.shop - Production Deployment Script
# ===========================================
# Usage: ./scripts/deploy.sh [command]
# Commands:
#   setup    - First-time setup (install Docker, configure firewall)
#   deploy   - Build and deploy the application
#   update   - Pull latest changes and redeploy
#   logs     - Show logs
#   status   - Show container status
#   backup   - Backup database
#   restore  - Restore database from backup
# ===========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env.prod"

# ===========================================
# Setup - First time installation
# ===========================================
setup() {
    log_info "Setting up production environment..."

    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run setup as root: sudo ./scripts/deploy.sh setup"
        exit 1
    fi

    # Install Docker
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    else
        log_info "Docker already installed"
    fi

    # Install Docker Compose plugin
    if ! docker compose version &> /dev/null; then
        log_info "Installing Docker Compose plugin..."
        apt-get update
        apt-get install -y docker-compose-plugin
    else
        log_info "Docker Compose already installed"
    fi

    # Configure firewall (UFW)
    if command -v ufw &> /dev/null; then
        log_info "Configuring firewall..."
        ufw allow 22/tcp   # SSH
        ufw allow 80/tcp   # HTTP
        ufw allow 443/tcp  # HTTPS
        ufw --force enable
    fi

    # Create .env.prod if not exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warn ".env.prod not found. Creating from example..."
        cp "$PROJECT_DIR/.env.prod.example" "$ENV_FILE"
        log_warn "Please edit $ENV_FILE with your production values!"
        exit 1
    fi

    log_info "Setup complete!"
}

# ===========================================
# Deploy - Build and start containers
# ===========================================
deploy() {
    log_info "Deploying Collector.shop..."

    # Check .env.prod exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env.prod not found. Run: cp .env.prod.example .env.prod"
        exit 1
    fi

    # Load environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    # Build images
    log_info "Building Docker images..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build

    # Start containers
    log_info "Starting containers..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

    # Wait for database to be ready
    log_info "Waiting for database..."
    sleep 10

    # Run migrations
    log_info "Running database migrations..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec backend npm run db:migrate || true

    # Show status
    log_info "Deployment complete!"
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

    echo ""
    log_info "Your app should be available at:"
    echo "  - Frontend: https://$DOMAIN"
    echo "  - API:      https://api.$DOMAIN"
    echo "  - API Docs: https://api.$DOMAIN/docs"
}

# ===========================================
# Update - Pull and redeploy
# ===========================================
update() {
    log_info "Updating Collector.shop..."

    # Pull latest code
    log_info "Pulling latest changes..."
    git pull origin main

    # Rebuild and restart
    deploy
}

# ===========================================
# Logs - Show container logs
# ===========================================
logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f "$service"
    else
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
    fi
}

# ===========================================
# Status - Show container status
# ===========================================
status() {
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
}

# ===========================================
# Backup - Backup PostgreSQL database
# ===========================================
backup() {
    local backup_dir="$PROJECT_DIR/backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/collector_backup_$timestamp.sql"

    mkdir -p "$backup_dir"

    log_info "Backing up database to $backup_file..."

    # Load environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
        pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$backup_file"

    # Compress
    gzip "$backup_file"

    log_info "Backup complete: ${backup_file}.gz"

    # Keep only last 7 backups
    ls -t "$backup_dir"/*.gz 2>/dev/null | tail -n +8 | xargs -r rm

    log_info "Old backups cleaned up (keeping last 7)"
}

# ===========================================
# Restore - Restore database from backup
# ===========================================
restore() {
    local backup_file=$1

    if [ -z "$backup_file" ]; then
        log_error "Usage: ./scripts/deploy.sh restore <backup_file.sql.gz>"
        log_info "Available backups:"
        ls -la "$PROJECT_DIR/backups/"*.gz 2>/dev/null || echo "No backups found"
        exit 1
    fi

    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi

    log_warn "This will OVERWRITE the current database. Are you sure? (yes/no)"
    read -r confirm
    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi

    # Load environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    log_info "Restoring database from $backup_file..."

    gunzip -c "$backup_file" | docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
        psql -U "$POSTGRES_USER" "$POSTGRES_DB"

    log_info "Restore complete!"
}

# ===========================================
# Stop - Stop all containers
# ===========================================
stop() {
    log_info "Stopping containers..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    log_info "Containers stopped"
}

# ===========================================
# Main
# ===========================================
case "${1:-deploy}" in
    setup)
        setup
        ;;
    deploy)
        deploy
        ;;
    update)
        update
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    stop)
        stop
        ;;
    *)
        echo "Usage: $0 {setup|deploy|update|logs|status|backup|restore|stop}"
        echo ""
        echo "Commands:"
        echo "  setup    - First-time setup (install Docker, configure firewall)"
        echo "  deploy   - Build and deploy the application"
        echo "  update   - Pull latest changes and redeploy"
        echo "  logs     - Show logs (optionally: logs <service>)"
        echo "  status   - Show container status"
        echo "  backup   - Backup database"
        echo "  restore  - Restore database from backup"
        echo "  stop     - Stop all containers"
        exit 1
        ;;
esac
