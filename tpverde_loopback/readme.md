Aplicacion ejemplo para explicar ap

npm install -g yo

yo install -g generator-loopback

crear el directorio tpverde_loopback

yo loopback

npm install loopback-connector-mongodb --save

Archivos de configuracion:

datasource.json: introducir configuracion del conector
/common/models/model.js
/common/models/model.json
model-config.json: conectar el modelo con el datasource



---------------------

meter cualquier tema en client

si index diferente que app:
middleware.json:
"files": {
    "loopback#static": [{
      "name": "client",
      "paths": ["/client"],
      "params": "$!../client"
    },
      {
        "name": "app",
        "paths": ["/client/app"],
        "params": "$!../client/app"
      }]
  }

server.js:
  app.use(loopback.static(path.resolve(__dirname, '../client')));
  app.use(loopback.static(path.resolve(__dirname, '../client/app')));

copiar tema en client

/scripts/directives/sidebar/sidebar.html link
/scripts/app.js añadimos ruta state

insertar componente

/client/bower install vis --save

index.html cargamos componente
