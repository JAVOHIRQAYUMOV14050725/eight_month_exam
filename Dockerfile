FROM node:16

WORKDIR /src/app

COPY package*.json ./
RUN npm install

COPY . .

COPY wait-for-it.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-it.sh


RUN npm install -g typescript

RUN npm run build

CMD ["./wait-for-it.sh", "db:5432", "--", "npm", "run", "start:prod"]

EXPOSE 3000
