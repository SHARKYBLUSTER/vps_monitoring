# Makefile pour VPS Monitoring Dashboard
# Utilisation : make <command>

.PHONY: help build up down restart logs shell clean pull

# Variables
IMAGE_NAME := vps-monitoring
CONTAINER_NAME := vps-monitoring
COMPOSE_FILE := docker-compose.yml

help: ## Affiche cette aide
	@echo "Commandes disponibles pour VPS Monitoring Dashboard:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'
	@echo ""

build: ## Construit l'image Docker
	docker-compose -f $(COMPOSE_FILE) build --no-cache

up: ## Démarre le conteneur en arrière-plan
	docker-compose -f $(COMPOSE_FILE) up -d

up-build: ## Construit et démarre le conteneur
	docker-compose -f $(COMPOSE_FILE) up -d --build

down: ## Arrête le conteneur
	docker-compose -f $(COMPOSE_FILE) down

restart: ## Redémarre le conteneur
	docker-compose -f $(COMPOSE_FILE) restart

logs: ## Affiche les logs en temps réel
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-tail: ## Affiche les 100 dernières lignes de logs
	docker-compose -f $(COMPOSE_FILE) logs --tail=100

shell: ## Ouvre un shell dans le conteneur
	docker exec -it $(CONTAINER_NAME) sh

clean: ## Supprime les conteneurs, réseaux et images
	docker-compose -f $(COMPOSE_FILE) down -v --rmi local

pull: ## Met à jour l'image depuis le registry
	docker-compose -f $(COMPOSE_FILE) pull

ps: ## Affiche l'état des conteneurs
	docker-compose -f $(COMPOSE_FILE) ps

# Commandes utiles pour le développement
dev-up: ## Démarre en mode développement (avec rebuild)
	docker-compose -f $(COMPOSE_FILE) -f docker-compose.dev.yml up -d --build

# Note: Pour utiliser docker-compose.dev.yml, créez un fichier avec des montages de volumes
# pour le développement à chaud (hot-reload)
