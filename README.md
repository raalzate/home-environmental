# Home Environmental
Este proyecto está enfocado para el desarrollo del control y gestión de sensores, el propósito es el tratamiento de información y la recopilación de datos desde diferentes sensores ambientales.

El Proyecto captura los datos por medio del protocolo MQTT, utilizando un Server-Side (nodejs) como mediador, para luego exponerlo en un webservice. 
Se debe ejecutar  el siguiente comando.
$ npm install

En esta versión se realiza un test de conectividad para el Borker MQTT, se utiliza el topic debug como suscritor y por medio de un publicado se envía los datos y se visualiza en consola los datos enviados. 
-	GET / para iniciar el observador
