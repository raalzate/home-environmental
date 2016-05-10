# Home Environmental
Este proyecto está enfocado para el desarrollo del control y gestión de sensores, el propósito es el tratamiento de información y la recopilación de datos desde diferentes sensores ambientales.

El Proyecto captura los datos por medio del protocolo MQTT, utilizando un Server-Side (nodejs) como mediador, para luego exponerlo en un webservice. 
Se debe ejecutar  el siguiente comando.
$ npm install

En esta versión se realiza un test de conectividad con la base de datos mongodb, para el ejemplo se realiza un insert de visitantes y luego lo consulta. El proyecto está basado en los siguientes routing:

-	GET / realiza el registros.
-	GET /visitors Consulta el número de visitas. 
