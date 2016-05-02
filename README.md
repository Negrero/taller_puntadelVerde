# taller_puntadelVerde
taller nodejs-angularjs

##  tpverde_apirest (Ejemplo de uso api rest con mongoose-express-angular)
```
npm init
npm install express --save
npm install mongoose --save
npm install body-parse --save
```
* creamos nuestro server.js
* creamos la carpeta public
* creamos public/main.js (aqui modulo/controlador/directiva/directiva propia)
* creaamos public/index.html

## tpverde_loopback (Aplicacion ejemplo para explicar framework loopback)
```
npm install -g yo
yo install -g generator-loopbacck
mkdir tpverde_loopback
cd tpverde_loopback
yo loopback

npm install loopback-connector-mongodb --save
```
Archivos de configuracion:

* datasource.json: introducir configuracion del conector
* /common/models/model.js
* /common/models/model.json
* model-config.json: conectar el modelo con el datasource


###  cualquier tema en carpeta client

* si index diferente que app:
* middleware.json:
```
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
```
* server.js:
```
  app.use(loopback.static(path.resolve(__dirname, '../client')));
  app.use(loopback.static(path.resolve(__dirname, '../client/app')));
```
* copiar tema en client
```
/scripts/directives/sidebar/sidebar.html link
/scripts/app.js añadimos ruta state
```
#### insertar componente
```
/client/bower install vis --save
```
* index.html cargamos componente


# tpverde-angular (ejemplo de creacion con yo proyecto angular)

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.15.1.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.
```
mkdir tpverde_angular
yo angular
```
* index.html nuevo enlace a articulo
* index.html cargar controller articulo
* app.js introducir ruto articulo
* controllers/articulo.js
* views/articulo.html
