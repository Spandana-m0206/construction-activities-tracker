# Makefile

.PHONY: mongo-up mongo-down mongo-logs mongo-shell

run:
	npm run dev

mongo-up:
	docker-compose -f docker-compose.dev.yaml up -d

mongo-down:
	docker-compose -f docker-compose.dev.yaml down

mongo-logs:
	docker-compose -f docker-compose.dev.yaml logs -f

mongo-shell:
	docker exec -it Maguz-api_mongodb mongo