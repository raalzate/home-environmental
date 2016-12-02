# Home Environmental
Este proyecto está enfocado para el desarrollo del control y gestión de sensores, el propósito es el tratamiento de información y la recopilación de datos desde diferentes sensores ambientales.

El Proyecto captura los datos por medio del protocolo MQTT, utilizando un Server-Side (nodejs) como mediador, para luego exponerlo en un webservice. 

Utiliza el kit de desarrollo NodeMCU para transmitir los datos y comunicar los sensores con el servidor, este desarrollo esta bajo un mismo lineamiento establecido por una librería estandarizada para el dialogo entre el servidor y los nodos.  Los nodos abarcan diferentes sensores, ya que el nodo trabaja bajo el modelo publicador. 

##Dependencias

- [Nodes](https://github.com/raalzate/home-environmental/tree/master/nodes)
- [Server](https://github.com/raalzate/home-environmental/tree/master/server)

## Topologia de la arquitectura 

![Diagrama de flujo](https://raw.githubusercontent.com/raalzate/home-environmental/master/asserts/topologia.png)

