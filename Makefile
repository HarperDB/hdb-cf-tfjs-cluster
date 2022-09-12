cf=tfjs-cluster

default: dev

r: restart_cf

dev: down
	docker run \
	  -d \
		-v $(shell pwd)/dashboard:/opt/harperdb/hdb/custom_functions/$(cf) \
		-e LOG_LEVEL=error \
		-e HDB_ADMIN_USERNAME=hdbcf \
		-e HDB_ADMIN_PASSWORD=hdbcf \
		-e LOG_TO_STDSTREAMS=true \
		-e RUN_IN_FOREGROUND=true \
		-e CUSTOM_FUNCTIONS=true \
		-e SERVER_PORT=9925 \
		-e CUSTOM_FUNCTIONS_PORT=9926 \
		-e MAX_CUSTOM_FUNCTION_PROCESSES=1 \
		-e CLUSTERING=true \
		-e CLUSTERING_PORT=12345 \
		-e CLUSTERING_USER=hdbuserc \
		-e CLUSTERING_PASSWORD=hdbuserc \
		-e NODE_NAME=tfjs-dashboard \
		-p 9405:9925 \
		-p 9406:9926 \
		-p 12345:12345 \
		-l tfjs-cluster \
		harperdb/harperdb:latest; \
	docker run \
		-d \
		-v $(shell pwd)/nodes:/opt/harperdb/hdb/custom_functions/$(cf) \
		-e LOG_LEVEL=error \
		-e HDB_ADMIN_USERNAME=hdbcf \
		-e HDB_ADMIN_PASSWORD=hdbcf \
		-e LOG_TO_STDSTREAMS=true \
		-e RUN_IN_FOREGROUND=true \
		-e CUSTOM_FUNCTIONS=true \
		-e SERVER_PORT=9925 \
		-e CUSTOM_FUNCTIONS_PORT=9926 \
		-e MAX_CUSTOM_FUNCTION_PROCESSES=1 \
		-e CLUSTERING=true \
		-e CLUSTERING_PORT=12345 \
		-e CLUSTERING_USER=hdbuserc \
		-e CLUSTERING_PASSWORD=hdbuserc \
		-e NODE_NAME=LOCATION-1 \
		-p 9415:9925 \
		-p 9416:9926 \
		-l tfjs-cluster \
		harperdb/harperdb:latest; \
	docker run \
		-d \
		-v $(shell pwd)/nodes:/opt/harperdb/hdb/custom_functions/$(cf) \
		-e LOG_LEVEL=error \
		-e HDB_ADMIN_USERNAME=hdbcf \
		-e HDB_ADMIN_PASSWORD=hdbcf \
		-e LOG_TO_STDSTREAMS=true \
		-e RUN_IN_FOREGROUND=true \
		-e CUSTOM_FUNCTIONS=true \
		-e SERVER_PORT=9925 \
		-e CUSTOM_FUNCTIONS_PORT=9926 \
		-e MAX_CUSTOM_FUNCTION_PROCESSES=1 \
		-e CLUSTERING=true \
		-e CLUSTERING_PORT=12345 \
		-e CLUSTERING_USER=hdbuserc \
		-e CLUSTERING_PASSWORD=hdbuserc \
		-e NODE_NAME=LOCATION-2 \
		-p 9425:9925 \
		-p 9426:9926 \
		-l tfjs-cluster \
		harperdb/harperdb:latest; \
	docker run \
		-d \
		-v $(shell pwd)/nodes:/opt/harperdb/hdb/custom_functions/$(cf) \
		-e LOG_LEVEL=error \
		-e HDB_ADMIN_USERNAME=hdbcf \
		-e HDB_ADMIN_PASSWORD=hdbcf \
		-e LOG_TO_STDSTREAMS=true \
		-e RUN_IN_FOREGROUND=true \
		-e CUSTOM_FUNCTIONS=true \
		-e SERVER_PORT=9925 \
		-e CUSTOM_FUNCTIONS_PORT=9926 \
		-e MAX_CUSTOM_FUNCTION_PROCESSES=1 \
		-e CLUSTERING=true \
		-e CLUSTERING_PORT=12345 \
		-e CLUSTERING_USER=hdbuserc \
		-e CLUSTERING_PASSWORD=hdbuserc \
		-e NODE_NAME=LOCATION-3 \
		-p 9435:9925 \
		-p 9436:9926 \
		-l tfjs-cluster \
		harperdb/harperdb:latest; \
	docker run \
		-d \
		-v $(shell pwd)/nodes:/opt/harperdb/hdb/custom_functions/$(cf) \
		-e LOG_LEVEL=error \
		-e HDB_ADMIN_USERNAME=hdbcf \
		-e HDB_ADMIN_PASSWORD=hdbcf \
		-e LOG_TO_STDSTREAMS=true \
		-e RUN_IN_FOREGROUND=true \
		-e CUSTOM_FUNCTIONS=true \
		-e SERVER_PORT=9925 \
		-e CUSTOM_FUNCTIONS_PORT=9926 \
		-e MAX_CUSTOM_FUNCTION_PROCESSES=1 \
		-e CLUSTERING=true \
		-e CLUSTERING_PORT=12345 \
		-e CLUSTERING_USER=hdbuserc \
		-e CLUSTERING_PASSWORD=hdbuserc \
		-e NODE_NAME=LOCATION-4 \
		-p 9445:9925 \
		-p 9446:9926 \
		-l tfjs-cluster \
		harperdb/harperdb:latest; \
	docker run \
		-d \
		-v $(shell pwd)/nodes:/opt/harperdb/hdb/custom_functions/$(cf) \
		-e LOG_LEVEL=error \
		-e HDB_ADMIN_USERNAME=hdbcf \
		-e HDB_ADMIN_PASSWORD=hdbcf \
		-e LOG_TO_STDSTREAMS=true \
		-e RUN_IN_FOREGROUND=true \
		-e CUSTOM_FUNCTIONS=true \
		-e SERVER_PORT=9925 \
		-e CUSTOM_FUNCTIONS_PORT=9926 \
		-e MAX_CUSTOM_FUNCTION_PROCESSES=1 \
		-e CLUSTERING=true \
		-e CLUSTERING_PORT=12345 \
		-e CLUSTERING_USER=hdbuserc \
		-e CLUSTERING_PASSWORD=hdbuserc \
		-e NODE_NAME=LOCATION-5 \
		-p 9455:9925 \
		-p 9456:9926 \
		-l tfjs-cluster \
		harperdb/harperdb:latest; \


restart_cf:
	curl http://localhost:9405 \
	-X POST \
	-H 'Content-Type: application/json' \
	-H 'Authorization: Basic aGRiY2Y6aGRiY2Y=' \
	-d '{"operation": "restart_service", "service": "custom_functions"}'

bash:
	docker run \
		-it \
		-v $(shell pwd)/dashboard:/opt/harperdb/hdb/custom_functions/$(cf) \
		-p 5173:5173 \
		harperdb/harperdb:latest \
		bash

down:
	docker stop $(shell docker ps -q --filter label=tfjs-cluster ) || exit 0
