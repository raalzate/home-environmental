# Home Environmental - Server

Servidor que permite realizar el almacenamiento y gestión de los nodos, trabaja en compañía de un Broke MQTT para el registro y control de las variables. 

El sistema esta construido para trabajar en un servidor liviano ya sea una Raspberry o un servidor en la nube, con un entorno en tiempo de ejecución miltiplataforma Nodejs, código abierto, basados en el lenguaje de programación ECMAScript, asíncrono, con I/O de datos, en una arquitectura orientada a eventos, con sockets. 

## Dependencias 

El sistema debe contar con: [nodejs](https://nodejs.org/es/), [npm](https://www.npmjs.com/), [mongodb](https://www.mongodb.com/es) y [mosquitto](https://mosquitto.org/). Mas información en el blog principal.  

### Instalaciones

```sh
$ apt-get update 

$ apt-get install -y git

$ curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
$ apt-get install -y nodejs

$ apt-get install -y mongodb

$ apt-get install -y mosquitto

```

## Como usarlo

Ingresar a la consola e instalar las dependncias.

```sh
$ git clone https://github.com/raalzate/home-environmental

$ cd home-environmental

$ cd server

$ npm install
```
Se debe inicial el servidor utilizando el siguiente comando.

```sh
$ npm start
```


## Indicaciones 

Conectar su INodeUH y configurarlo para que este apuntando a la IP del servidor, el sistema debe hacer lo siguiente:

1. El INodeUH debe publicar en el topic "register" el valor ID del Node
2. El Node debe publicar/register los sensores separados por comas, al topic "register/{ID-NODE}"
3. El Nodo publica cada dato del sensor correspondiente asociado al ID del Nodo, en el topic “{ID-NODE}/{TAG-SENSOR}”

### Ejemplo

1. topic = register y mensaje = node02-home
2. topic = register/node02-home y mensaje = temperatura,humedad
3. topic = node02-home/temperatura y mensaje 27
4. topic = node02-home/humedad y mensaje 30

Se repiten los pasos 3 y 4 las veces necesarios a los datos tomados por los sensores.

## Visualizar widgets de los sensores

Para disponer de las gráficas debemos ingresar por url la ruta [http://localhost:3300/](http://localhost:3300/).

Mas información:

http://noterau.blogspot.com.co/2016/05/sensor-ambiental-prototipo.html

