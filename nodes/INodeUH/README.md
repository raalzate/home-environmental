# INodeHU

INodeHU (Internet Node Home Use), permite la integración estandar para la publicación de datos por medio de un cliente MQTT, esta librería sigue un flujo con el objetivo de estabecer un camino de decisión para cada caso, por ejemplo para la configuración de la red, para el registro del nodo, para la publicación del dato, etc. 

## Dependencias
 - EEPROM
 - ESP8266WiFi
 - PubSubClient
 - Wire
 - WiFiClient 
 - ESP8266WebServer
 
Este sistema esta diseñado para la board de nodemcu v1.0, debe seguir la siguiente guía para configuración: [Quick Start to Nodemcu (ESP8266) on Arduino IDE](http://www.instructables.com/id/Quick-Start-to-Nodemcu-ESP8266-on-Arduino-IDE/).


## Instalación
Para la instalación debe comprimir la carpeta e importarla en su IDE Arduino, de esta forma Arduino la ingresa en su biblioteca principal.

**Nota:** El sistema se conecta a un servidor local/remoto con una ip estática, que sería nuestro sistema Raspberry u otro configurado con el proyecto: [Home Environmental](https://github.com/raalzate/home-environmental) trabajado con nodejs.

## Diagrama de flujo para el Setup
![Diagrama de flujo](https://raw.githubusercontent.com/raalzate/home-environmental-nodemcu/master/asserts/img_inode_setup.png)


