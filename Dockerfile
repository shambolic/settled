FROM node:0.12.15

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.9.3

ENV HOME=/home/app

COPY package.json npm-shrinkwrap.json $HOME/settled/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/settled
RUN npm install
RUN npm cache clean

USER root
COPY . $HOME/settled
RUN chown -R app:app $HOME/*
USER app

CMD ["node", "index.js"]