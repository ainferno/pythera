.PHONY: up down restart logs logs-backend logs-frontend logs-db ps psql backend-local frontend-local tidy clean help

help:
	@echo "Targets:"
	@echo "  up              - docker compose up --build (starts db+backend+frontend)"
	@echo "  down            - docker compose down"
	@echo "  restart         - down + up"
	@echo "  logs            - tail all compose logs"
	@echo "  logs-backend    - tail backend logs"
	@echo "  logs-frontend   - tail frontend logs"
	@echo "  logs-db         - tail db logs"
	@echo "  ps              - docker compose ps"
	@echo "  psql            - open psql inside the db container"
	@echo "  backend-local   - run backend on host (needs Go and a reachable DB)"
	@echo "  frontend-local  - run Vite dev server on host (needs Node)"
	@echo "  tidy            - go mod tidy + npm install"
	@echo "  clean           - docker compose down -v (DROPS the DB volume)"

up:
	docker compose up --build

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

ps:
	docker compose ps

psql:
	docker compose exec db sh -c 'psql -U $$POSTGRES_USER $$POSTGRES_DB'

backend-local:
	cd backend && go run ./cmd/server

frontend-local:
	cd frontend && npm run dev

tidy:
	cd backend && go mod tidy
	cd frontend && npm install

clean:
	docker compose down -v
