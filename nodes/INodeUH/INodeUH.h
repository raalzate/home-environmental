/*
||
|| @file INodeUH.h
|| @version 1.0 Beta
|| @author Raul .A Alzate
|| @contact alzategomez.raul@gmail.com
||
|| @description
|| | Esta libreria permite realizar una facil configuracion del nodomcu/esp8266, 
|| | funciona como publicador de diferentes sensores, agregando en un arreglo asociativo los sensores y los valores
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
#ifndef INodeUH_h

#define INodeUH_h

#include <EEPROM.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <WiFiClient.h> 
#include <ESP8266WebServer.h>

#include "IConstants.h"

class INodeUH
{
  
	/*
	* Contructor permite incializar el nodo
	* @param nameNode: nombre del nodo
	*/
	public: INodeUH(String nameNode, String sensors);

	/*
	* Permite realizar la configuraciones previas antes de ejecutar el programa
	*/
	void setup();

	/*
	* Realiza una reconexion al servidor MQTT
	*/
	void reconnect();

	/*
	* Pregunta si tiene una interrupcion, 
	* el cual indica que esta o no configurado por completo el nodo
	*/
	bool isConfigurable(void);

	/*
	* Pregunta si esta conectado 
	*/
	bool isConnected(void);

	/*
	* Funcion cliente para el manejo de configuracion rest/client
	*/
	void handleServerAP();

	/*
	* Publica la data asociada a los sensores
	*/
	void publishData();
	
	/*
	* Agrega la informacion para cada sensor, donde se define en un arreglo asociativo
	* @param sensor: nombre del sensor, ej. temperatura
	* @param data: valor del sensor, ej. 24
	*/
	void addDataToSensor(char* sensor, double data);

	void loop();
	
	void cleanDataWifi();

	private: void settingPinMode();
	private: void settingWifi();
	private: void publishRegister();
	private: void sleepIntro();
	private: void sleppOutput();
	private: int isValidWifi();
	private: void findSsidAndPassword();
	private: void settingAccessPoint();
	private: void saveWifiAndTopic(String ssid,  String password);
	private: void handleRegisterAuthWiFi();

	private: String _essid; 
	private: String _epass;
	private: String _nameNode;
	private: bool _interrupt;
	private: int _indexSensors;
	private: String _sensors;
	private: char* _nameSensors[5];
	private: double _dataSensors[5];
	
};

#endif

