FROM node:18
WORKDIR /src/main.ts
COPY package.json ./
RUN npm install 
COPY . .
RUN npm run build
CMD [ "npm" , "run", "start:dev" ]