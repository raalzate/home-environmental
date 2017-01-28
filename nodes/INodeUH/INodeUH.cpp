/*
||
|| @file INodeUH.cpp
|| @version 1.0 Beta
|| @author Raul .A Alzate
|| @contact alzategomez.raul@gmail.com
||
|| @description
|| | Implemementaccion que permite una facil configuracion del nodomcu/esp8266
|| #
||
|| @license
|| | This library is free software; you can redistribute it and/or
|| | modify it under the terms of the GNU Lesser General Public
|| | License as published by the Free Software Foundation; version
|| | 2.1 of the License.
|| |
|| | This library is distributed in the hope that it will be useful,
|| | but WITHOUT ANY WARRANTY; without even the implied warranty of
|| | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
|| | Lesser General Public License for more details.
|| |
|| | You should have received a copy of the GNU Lesser General Public
|| | License along with this library; if not, write to the Free Software
|| | Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
|| #
||
*/

#include "INodeUH.h"


WiFiClient       espClient;
ESP8266WebServer server(80);
PubSubClient     client(espClient);


INodeUH::INodeUH(String ip, String nameNode, String sensors)
{
  _nameNode = nameNode;
  _indexSensors = 0;
  _sensors = sensors;
  _ip = ip;
}

void INodeUH::setup()
{
  delay(1000);
  Serial.begin(9600);
  
  settingPinMode();
  settingWifi();
}

bool INodeUH::isConfigurable(void)
{
 	return !_interrupt;
}

void INodeUH::handleServerAP()
{
	 server.handleClient(); 
}

void INodeUH::reconnect()
{
   Serial.println("\nServer MQTT Connecting..");
   while (!client.connected()) {
     Serial.print(".");
     if (client.connect(_nameNode.c_str())) {
        Serial.println(" Connected MQTT!");
        digitalWrite(LED_STATUS_OUTSERVICE, LOW);
        digitalWrite(LED_STATUS_INSERVICE, HIGH);
        publishRegister();
        delay(1000); 
     } else {
        digitalWrite(LED_STATUS_OUTSERVICE, HIGH);
        digitalWrite(LED_STATUS_INSERVICE, LOW);
        Serial.print(" failed, rc=");
        Serial.print(client.state());
        Serial.println(" try again in 5 seconds");
        delay(5000);
      }
   }
}

void INodeUH::addDataToSensor(char* sensor, double data){
	_nameSensors[_indexSensors] = sensor;
	_dataSensors[_indexSensors] = data;
	_indexSensors++;
}

void INodeUH::publishRegister()
{
  //se realiza la publicacion del registro [register/node]	con le valor de los sensores
  String topic = "register/"+_nameNode;
  Serial.print("\nThe node is registered correctly => ");
  Serial.print(topic);
  Serial.print(" : ");
  Serial.println(_sensors);
  client.publish("register", _nameNode.c_str(), false);//<-- TODO: lo tiene que hacer la app
  client.publish(topic.c_str(), _sensors.c_str(), false);
}


void INodeUH::publishData()
{
   sleepIntro();
   //se consulta todos los sensores para realiza la publicacion al [node/sensor]
   Serial.println();
   for (byte i=0; i<_indexSensors; i++){
		String topic = _nameNode+"/"+_nameSensors[i];
		String data = String(_dataSensors[i]);
		Serial.print("-- The data is send with this info => ");
		Serial.print(topic);
		Serial.print(" : ");
		Serial.println(data);
		client.publish(topic.c_str(), data.c_str());
   }
   _indexSensors = 0;
   sleppOutput();
}

void INodeUH::loop()
{
  client.loop();
}

bool INodeUH::isConnected()
{
  return client.connected();
}


void INodeUH::sleepIntro()
{
  digitalWrite(LED_STATUS_SEND, HIGH);
  delay(100);
}

void INodeUH::sleppOutput()
{
  delay(5000);
  digitalWrite(LED_STATUS_SEND, LOW);
}

void INodeUH::settingPinMode()
{
  pinMode(LED_STATUS_SEND, OUTPUT);
  pinMode(LED_STATUS_OUTSERVICE, OUTPUT);
  pinMode(LED_STATUS_INSERVICE, OUTPUT);
}

void INodeUH::settingWifi()
{

  client.setServer(_ip.c_str(), 1883);
  Serial.println("\nStartup");
  findSsidAndPassword();
  if (_essid.length() > 3 ) {
      WiFi.begin(_essid.c_str(), _epass.c_str());
      if (isValidWifi() == 20 ) { 
         Serial.print("\nConnected WIFI.");
      } else {
         Serial.println("\nNo Connected. {"+_essid+"}");
         _interrupt = 1;
         settingAccessPoint();
      }
  }  else {
      _interrupt = 1;
      Serial.println("\nNo Connected.");
      settingAccessPoint();
  }

}

int INodeUH::isValidWifi() 
{
  int c = 0;
  Serial.println("Waiting for Wifi to connect");  
  while ( c < 20 ) {
    if (WiFi.status() == WL_CONNECTED) { 
      return(20); 
    } 
    delay(500);
    Serial.print(".");    
    c++;
  }
  Serial.println("\nConnect timed out");
  return(10);
} 

void INodeUH::findSsidAndPassword()
{

  EEPROM.begin(512);
  for (int i = 0; i < 32; ++i){
    _essid+=char(EEPROM.read(i));    
  }
  for (int i = 32; i < 62; ++i){
    _epass+=char(EEPROM.read(i));
  }
  EEPROM.end();
}



void INodeUH::settingAccessPoint()
{

  WiFi.softAP(AP_SSID, AP_PASSWORD);
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);
  server.on("/settingWifi", std::bind(&INodeUH::handleRegisterAuthWiFi, this));
  server.begin();
  Serial.println("HTTP server started");
}


void INodeUH::cleanDataWifi()
{
   EEPROM.begin(512);
   Serial.println("\n*** Clearing eeprom");
   for (int i = 0; i < 68; ++i) { EEPROM.write(i,0); }
   EEPROM.commit(); 
   EEPROM.end();
}

void INodeUH::saveWifiAndTopic(String ssid,  String password)
{
  EEPROM.begin(512);  
  for (int i = 0; i < ssid.length(); ++i){ 
    EEPROM.write(i, ssid[i]);
  }
  for (int i = 0; i < password.length(); ++i){
    EEPROM.write(32+i, password[i]);
  }

  Serial.println("Save OK"); 
  EEPROM.commit();
  EEPROM.end(); 
}

void INodeUH::handleRegisterAuthWiFi() 
{

  String argSSID     = server.arg("ssid");
  String argPassword = server.arg("password");
 
  cleanDataWifi();
  saveWifiAndTopic(argSSID,argPassword);
  String reqJson = "{\"status\":\"success\",\"sensors\":\""+_sensors+"\",\"ip\":\""+_ip+"\",\"node\":\""+_nameNode+"\"}";
  server.send(200, "application/json",  reqJson);
  WiFi.disconnect();
  delay(1000);
  ESP.restart();
 
	 
}



