## LIMS App
**Technology: node.js**
**DB: MySQL**

## ---------------------------------------

## Product UI/UX
- https://www.figma.com/design/ekJy2uZzxVmirxANVrGjIb/Tech-India?node-id=0-1&node-type=canvas&t=8xxd3Y1tgOXpIf8w-0

## ---------------------------------------

***This is docker container version of service.***


- To setup application - you will need to copy `env-example.txt` and create `.env` file in root directory and define following values
- Create a schema in MySQL `CREATE SCHEMA prodoc DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`


***Some useful Docker commands from my Mac installation***
- cd to application directory
- create `.env` file
- Build container: `docker build -t lims_v1 .`
- Start Container: `docker run -d -p 3100:3100 -v $PWD:/app --name lims lims_v1:latest`
- Container Logs: `docker logs -f lims`
- Restart App: `docker exec -it lims /app/restart.sh`
- Container login: `docker exec -it lims /bin/sh`
