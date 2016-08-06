# Home Environmental
Este proyecto está enfocado para el desarrollo del control y gestión de sensores, el propósito es el tratamiento de información y la recopilación de datos desde diferentes sensores ambientales.

El Proyecto captura los datos por medio del protocolo MQTT, utilizando un Server-Side (nodejs) como mediador, para luego exponerlo en un webservice. 

Se debe ejecutar  el siguiente comando para instalar las dependencias.

$ npm install

Se debe inicial el servidor utilizando el siguiente comando.

$ node index.js

## Dependencias 

El sistema debe contar con: nodejs, mongodb y mosquitto. Mas información en el blog principal.  

## Indicaciones 

1. Para iniciar es necesario registrar el nodo para ello utilizamos el topic **register** con el mensaje del nombre del nodo ej. “temperatura”.
2. Debemos enviar un valor numerico que corresponde al censo, para ello utilizamos el topic **sensor** con el mensaje correspondiente.
3. Para obtener los nodos registrados hacemos uso del servicio Rest, utilizando cualquier tipo de cliente Rest “{ip-local}:3300/rest/sensors” 


## Charts

Para disponer de las gráficas debemos ingresar por url la ruta {ip-local}:3300/charts.

Mas información:

http://noterau.blogspot.com.co/2016/05/sensor-ambiental-prototipo.html

