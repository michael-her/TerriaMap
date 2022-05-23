# Docker image for the primary terria map application server
FROM node:14.17.0

RUN apt-get update && apt-get install -y gdal-bin

RUN mkdir -p /usr/src/app && mkdir -p /etc/config/client
WORKDIR /usr/src/app/component

COPY . /usr/src/app

RUN echo $(ls -anl /usr/src/app)

#RUN cp /usr/src/app/component/wwwroot/config.json /etc/config/client/config.json wwwroot/config.json

#RUN rm wwwroot/config.json && ln -s /etc/config/client/config.json wwwroot/config.json

RUN echo $(ls -anl /usr/src/app/component)

EXPOSE 3001

CMD [ "node", "./packages/terriajs-server/lib/app.js", "--config-file", "devserverconfig.json" ]
