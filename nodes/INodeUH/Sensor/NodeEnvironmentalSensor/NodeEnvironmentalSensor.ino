
#include <INodeUH.h>
#include <DHT.h>

#define DHTPIN 12 //D6
#define PUT_QUALITY A0
#define DHTTYPE DHT11 

INodeUH inode("node002-environmental", "temperatura,humedad,calidad");
DHT dht(DHTPIN, DHTTYPE);

void setup() 
{
  dht.begin();
  inode.setup();
}

void loop() {

   if(!inode.isConfigurable()) {
      inode.handleServerAP(); 
   } else {
     if (!inode.isConnected()) {
       inode.reconnect();
     }
     delay(5000);
     inode.addDataToSensor("temperatura", getSensorTemperature());
     inode.addDataToSensor("humedad", getSensorHumedad());
     inode.addDataToSensor("calidad", getSensorCalidad());
     inode.publishData();
     inode.loop();
   }
}


double getSensorTemperature()
{
  return dht.readTemperature();
}

double getSensorHumedad()
{
  return dht.readHumidity();
}

double getSensorCalidad()
{
  return String(analogRead(PUT_QUALITY)).toFloat();
}
