# Cliente Nodemcu / Home Environmental

Para poder realizar el censo de los datos ambientales se realiza un pequeño cliente que permite obtener la lectura de un sensor, utilizando el IDE de Arduino para el desarrollo del Software y el Hardware Nodemcu/ESP8266 para la comunicación por medio de una red doméstica WIFI. 

## Dependencias
 - [INodeUH (Internet Node Use Home)](./tree/master/INodeUH/)
 
Para mas indicaciones de la libreria del nodemcu para arduino ingresa aquí: [Quick Start to Nodemcu (ESP8266) on Arduino IDE](http://www.instructables.com/id/Quick-Start-to-Nodemcu-ESP8266-on-Arduino-IDE/).


## Como usarlo

1. Comprima la carpeta "INodeUH" en un .ZIP
2. Importe la librería a tu Arduino: Arduino => Sketch => Include Library => Add .ZIP Library...
3. Abra la el sensor Ambiental: Arduino => File => Examples => INodeUH => Sensor => NodeEnvironmentalSensor
4. Conecte un NodeMCU a su Arduino.
5. Abra el Serial Window del Arduino IDE.

## Configuración
Cuando tengamos todo instalado en nuestro PC debemos quemar el Software utilizando el IDE de Arduino, 
utilizamos la APK para configurar nuestro nodemcu, debemos descargar [aquí](https://raw.githubusercontent.com/raalzate/home-environmental/master/asserts/app-debug.apk):

1. Conecte el nodemcu al PC y abra la aplicación en Android, luego precione el boton de buscar, es posible que no encuentre al instante el dispositivo, intente varias veces. 
2. Ingresar los datos de tu red para configurar el nodemcu.
3. Realizar un reset al Nodemcu.
4. Verificar estado en el nodemcu.

**Nota:** El sistema se conecta a un servidor local/remoto con una ip estática, que sería nuestro sistema Raspberry u otro configurado con el proyecto: [Home Environmental](https://github.com/raalzate/home-environmental) trabajado con nodejs.



## Ejemplo

```c++
#include <INodeUH.h>

INodeUH inode("node002-ambiente", "temperatura,humedad,calidad");//nombre del nodo y tags para los sensores

void setup() {
  inode.setup();
}

void loop() {

   if(!inode.isConfigurable()) { // si aun no se ha configurado
      inode.handleServerAP(); 
   } else {
     if (!inode.isConnected()) {//se intenta reconectar si no esta conectado
       inode.reconnect();
     }
     //este nodo tiene dos sensores
	   inode.addDataToSensor("temperatura", 20); //agrega el valor para el sensor de temperatura
     inode.addDataToSensor("humedad", 15);//agrega el valor para el sensor de humedad
	 
	   //envia todos los datos de cada sensor, realizado una publicacion 
     inode.publishData();
     
     inode.loop();
   }
}
```

## Diagrama de flujo de la configuración
![Diagrama de flujo](https://raw.githubusercontent.com/raalzate/home-environmental-nodemcu/master/asserts/img_config.png)


