.PHONY: dev dev-full build migrate seed clean logs shell-api shell-db redis-cli

dev:
	docker-compose up -d postgresdb redis
	pnpm dev

dev-full:
	docker-compose up

build:
	pnpm turbo build

migrate:
	pnpm db:migrate

seed:
	pnpm db:seed

clean:
	docker-compose down -v
	rm -rf apps/*/dist apps/*/.next packages/*/dist

logs:
	docker-compose logs -f

shell-api:
	docker-compose exec api sh

shell-db:
	docker-compose exec postgresdb psql -U postgres -d dev

redis-cli:
	docker-compose exec redis redis-cli
