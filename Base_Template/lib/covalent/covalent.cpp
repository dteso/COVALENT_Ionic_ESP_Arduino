
#include "covalent.h"
#include <serial.hpp>
#include <mqtt.hpp>
#include "myoled.cpp"

/*-------------VARIABLES DE TIEMPO---------------------*/
int newValue;
int currentValue;
int sec = 0, mn = 0, hor = 0;
/*******************************************************/

const char *hostname = "ESP8266_1";

IPAddress ip(192, 168, 1, 17);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
DHT dht(DHTPIN, DHTTYPE); //Constructor para el sensor de temperatura
// Wifi Server
WiFiServer webServer(80);
WiFiUDP ntpUDP;
char *ntpServer = "0.es.pool.ntp.org";
NTPClient timeClient(ntpUDP, ntpServer, -10800, 6000);
boolean blink = false;
int lastSec = 0;
SerialCore serialCore;
Status status;
Mqtt mqttClient;
char message[200] = "";
char topic[100] = "";

Covalent::Covalent() {}

/*
 * lECTURA Y CONTROL DE COMUNICACIÓN EN LOS DISTINTOS CANALES MQTT 
 */
void verifyData(String data)
{
    String ownTopic = "medusa/set/" + status.deviceName;
    ownTopic.toCharArray(topic, 100);
    char main_topic[200] = "medusa/devices/outputs";

    if (mqttClient.lastTopic == ownTopic)
    {
        serialCore.send("DEVICE NAME >>>" + status.deviceName);
        serialCore.send("LAST TOPIC: " + mqttClient.lastTopic);

        serialCore.send("RECEIVED DATA ON TOPIC SET >" + data);
        if (data == "D6=1")
        {
            digitalWrite(D6, HIGH);
        }
        else if (data == "D6=0")
        {
            digitalWrite(D6, LOW);
        }
    }
    else if (mqttClient.lastTopic == main_topic)
    {
        if (data == "SUPERV")
        {
            serialCore.send("LAST TOPIC: " + mqttClient.lastTopic);
            String deviceData;
            serialCore.send("SUPERVISION REQUEST RECEIVED FROM DEVICE " + status.deviceName);
            deviceData = "{localIp: '" + status.localIp + "' , ssid: '" + status.ssid + "', name: '" + status.deviceName + "' ,temp: '" + status.temperature + "' , hum: '" + status.humidity + "'}";
            deviceData.toCharArray(message, 200);
            mqttClient.publishString(main_topic, message);
        }
    }
    data = "";
    mqttClient.data = "";
    mqttClient.lastTopic = "";
}


/*
 * SETUP COVALENT -> Inicialización de parámetros generales
 */
void Covalent::setup()
{
    this->setStoredStatus();
    pinMode(D4, OUTPUT);
    pinMode(D5, OUTPUT);
    pinMode(D6, OUTPUT);
    // Initial outputs test
    digitalWrite(D4, HIGH);
    delay(500);
    digitalWrite(D4, LOW);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D5, LOW);
    digitalWrite(D6, HIGH);
    delay(500);
    digitalWrite(D6, LOW);
    //////////////////////
    serialCore.beginBT(serialCore.BT_BAUDRATE, SWSERIAL_8N1, 13, 15, false, 256);
    Serial.begin(serialCore.SERIAL_BAUDRATE);
    EEPROM.begin(this->EEPROM_SIZE);
    dht.begin();
    this->WEB_SERVER_ENABLED = this->readStringFromMemory(WEB_SERVER_STATUS_DIR).indexOf("1") > -1 ? true : false;
    this->NTP_SERVER_ENABLED = true;
    this->saveStringInMemory(NTP_SERVER_STATUS_DIR, "1");
    loadingScreen();
    display.clearDisplay();
    display.drawBitmap(0, 0, medusaka_logoBitmap, 128, 64, WHITE);
    display.display();
    //this->readStringFromMemory(MQTT_SERVER_DIR).toCharArray(mqttClient.mqtt_server, 100);
    status.mqttServer = mqttClient.mqtt_server;
    mqttClient.deviceName = this->readStringFromMemory(DEVICE_NAME_DIR);
    mqttClient.setupMqtt();
    if (WiFi.isConnected())
    {
        this->ntp();
    }
    this->getStatus();
}


/*
 * LOOP COVALENT :  Ciclo principal
 */
void Covalent::loop()
{
    String serialReading = serialCore.readSerial();
    String btReading = serialCore.readBT();
    if (serialReading != "")
    {
        this->verifyCommands(serialReading);
    }
    else if (btReading != "")
    {
        this->verifyCommands(btReading);
    }

    if (this->WEB_SERVER_ENABLED)
    {
        this->renderWebServer();
    }

    if (WiFi.isConnected())
    {
        status.localIp = WiFi.localIP().toString();
        mqttClient.mqtt_loop();
        verifyData(mqttClient.data);
    }
    this->reloj();
}

/**********************************************************************************************
 *                                       UTILS
 **********************************************************************************************/

void blinkBackground()
{
    display.clearDisplay();
    display.clearDisplay();
    display.drawBitmap(0, 0, medusaka_logoBitmap2, 128, 64, WHITE);
    display.display();
    if (lastSec != sec)
    {
        lastSec = sec;
        blink = true;
    }
    else
    {
        blink = false;
    }
    if ((blink) && (sec == 2 || sec == 3 || sec == 4 || sec == 10 || sec == 11 || sec == 13 || sec == 16 || sec == 20 || sec == 21 || sec == 25 || sec == 26 || sec == 30 || sec == 34 || sec == 37 || sec == 49 || sec == 51 || sec == 57 || sec == 58 || sec == 59))
    {
        blink = false;
        display.clearDisplay();
        display.drawBitmap(0, 0, medusaka_logoBitmap2, 128, 64, WHITE);
        display.display();
        delay(70);
        display.clearDisplay();
        display.drawBitmap(0, 0, medusaka_logoBitmap, 128, 64, WHITE);
        display.display();
    }
}

void Covalent::reloj()
{
    newValue = (millis() / 1000);
    if (newValue != currentValue)
    {
        currentValue = newValue;
        // +1 SEGUNDO
        sec++;

        if (sec % 9 == 0)
        {
            blink = true;
            lastSec = sec;
            blinkBackground();
            display.display();
        }
        else if (sec % 6 == 0)
        {
            display.clearDisplay();
            displayPrint(4, 5, 0, status.ntpData);
            displayPrint(1, 30, 37, "TEMPERATURE");
            displayPrint(2, 20, 49, status.temperature + ".C");
        }
        else if (sec % 3 == 0)
        {
            display.clearDisplay();
            displayPrint(4, 5, 0, status.ntpData);
            displayPrint(1, 34, 37, "HUMIDITY");
            displayPrint(2, 25, 49, status.humidity + "%");
        }

        if (sec == 1)
        {
            display.clearDisplay();
            displayPrint(4, 5, 0, status.ntpData);
        }
        if (sec == 60)
        {
            sec = 0;
            // +1 MINUTO
            mn++;
            if (WiFi.isConnected())
            {
                Weather currentWeather;
                currentWeather = this->readWeather();
                String tempTopic = "medusa/get/"+status.deviceName+"/temperature";
                String humTopic = "medusa/get/"+status.deviceName+"/humidity";
                char topicTemp[100];
                char topicHum[100];
                tempTopic.toCharArray(topicTemp, 100);
                humTopic.toCharArray(topicHum, 100);
                mqttClient.publishFloatValue(topicTemp, currentWeather.temp);
                snprintf(message, 50, " %.2f", currentWeather.temp);
                serialCore.sendInLine(">>> Published on server: " + (String)mqttClient.mqtt_server + " - Topic: " + tempTopic + " > ");
                delay(10);
                serialCore.send(message);
                delay(10);
                mqttClient.publishFloatValue(topicHum, currentWeather.hum);
                snprintf(message, 50, " %.2f", currentWeather.hum);
                serialCore.sendInLine(">>> Published on server: " + (String)mqttClient.mqtt_server + " - Topic: " + humTopic + " > ");
                delay(10);
                serialCore.send(message);
                delay(10);
            }
            this->ntp();
        }
        //          ----------------------------
        if (mn == 60)
        {
            mn = 0;
            // +1 HORA
            hor++;
            //-------------EVERY HOUR METHODS---------------
        }
        //-------------EVERY SECOND METHODS---------------
    }
}

void Covalent::setStoredStatus()
{
    status.deviceName = this->readStringFromMemory(DEVICE_NAME_DIR);
    status.localIp = this->readStringFromMemory(LOCAL_IP_DIR);
    status.bluetoothId = this->readStringFromMemory(BT_ID_DIR);
    status.STA_connected = WiFi.isConnected();
    status.wifiMac = WiFi.macAddress();
    status.localIp = WiFi.localIP().toString();
    status.deviceType = this->readStringFromMemory(DEVICE_TYPE).toInt();
    status.webServerEnabled = this->readStringFromMemory(WEB_SERVER_STATUS_DIR);
}

void Covalent::verifyCommands(String reading)
{
    digitalWrite(D5, HIGH);
    serialCore.send(reading);

    String value = WIFI_SSID;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        serialCore.send("[ESP_SERIAL] - WiFi SSID is " + aux);
        this->saveStringInMemory(SSID_DIR, aux);
        aux = "";
        this->SSIDreadFromMemory = this->readStringFromMemory(SSID_DIR);
        serialCore.send("[ESP-EEPROM] - EEPROM read at dir [ " + (String)SSID_DIR + " ] ::: " + SSIDreadFromMemory + " - Size: " + SSIDreadFromMemory.length());
    }
    delay(10);
    value = WIFI_PASS;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        boolean readCompleted = false;
        aux = reading.substring(value.length(), reading.length());
        serialCore.send("[ESP_SERIAL] - WiFi Password is " + aux);
        readCompleted = this->saveStringInMemory(WIFI_PASS_DIR, aux);
        if (!readCompleted)
        {
            serialCore.send("[ESP-EEPROM] - " + aux + " >>> Saved in eeprom");
            readCompleted = false;
        }
        aux = "";
        passReadFromMemory = readStringFromMemory(WIFI_PASS_DIR);
        this->ConnectWiFi_STA(false, SSIDreadFromMemory, passReadFromMemory);
    }
    delay(10);
    value = APP_DATA;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        aux = "";
    }
    delay(10);
    value = EEPROM_RESET;
    if (reading.indexOf(value) > -1)
    {
        serialCore.send("[ESP-EEPROM] - Formatting EEPROM. Please wait...");
        this->clearMemory();
        serialCore.send("[ESP-EEPROM] - Memory formatted");
        WiFi.disconnect();
        serialCore.send("[ESP-NET] - STA_STATUS_KO");
    }
    delay(10);
    value = CREATE_WEB_SERVER;
    if (reading.indexOf(value) > -1)
    {
        serialCore.send("[ESP_NET] - WEB SERVER ENABLED");
        WEB_SERVER_ENABLED = true;
        this->saveStringInMemory(WEB_SERVER_STATUS_DIR, "1");
        webServer.begin();
        delay(100);
    }
    delay(10);
    value = CLOSE_WEB_SERVER;
    if (reading.indexOf(value) > -1)
    {
        serialCore.send("[ESP_NET] - WEB SERVER CLOSED");
        WEB_SERVER_ENABLED = false;
        this->saveStringInMemory(WEB_SERVER_STATUS_DIR, "0");
        webServer.close();
    }
    delay(10);
    value = ENABLE_NTP;
    if (reading.indexOf(value) > -1)
    {
        serialCore.send("[ESP_NTP] - NTP ENABLED");
        NTP_SERVER_ENABLED = true;
        this->saveStringInMemory(NTP_SERVER_STATUS_DIR, "1");
        delay(100);
    }
    delay(10);
    value = DISABLE_NTP;
    if (reading.indexOf(value) > -1)
    {
        serialCore.send("[ESP_NTP] - NTP DISABLED");
        NTP_SERVER_ENABLED = false;
        this->saveStringInMemory(NTP_SERVER_STATUS_DIR, "0");
    }
    delay(10);
    value = READ_STATUS;
    if (reading.indexOf(value) > -1)
    {
        serialCore.send("[ESP_NET] - STATUS_READ_START");
        this->getStatus();
    }
    delay(10);
    value = READ_WEATHER;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        Weather currentWeather;
        serialCore.send("[ESP_NET] - WEATHER_READ_START");
        currentWeather = this->readWeather();
        serialCore.send("[ESP-DHT] - HUM: " + (String)currentWeather.hum);
        serialCore.send("[ESP-DHT] - TEMP: " + (String)currentWeather.temp);
    }
    delay(10);
    value = BLUETOOTH_CONNECTED;
    if (reading.indexOf(value) > -1)
    {
        serialCore.send("[ESP-SYS] - Bluetoth connected");
        status.btEnabled = true;
    }
    delay(10);
    value = BLUETOOTH_ID;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        status.bluetoothId = aux;
        this->saveStringInMemory(BT_ID_DIR, status.bluetoothId);
        serialCore.send("[ESP-SYS] - Bluetooth ID is: " + this->readStringFromMemory(BT_ID_DIR));
    }
    delay(10);
    value = DEVICE_NAME;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        serialCore.send("[ESP-SYS] - DEVICE NAME:" + aux);
        this->saveStringInMemory(DEVICE_NAME_DIR, aux);
        aux = "";
        status.deviceName = this->readStringFromMemory(DEVICE_NAME_DIR);
        mqttClient.deviceName =  status.deviceName;
        mqttClient.reconnect(true);
        //serialCore.send("[ESP-EEPROM] - EEPROM read at dir [ " + (String)DEVICE_NAME_DIR + " ] ::: " + deviceNameReadFromMemory + " - Size: " + deviceNameReadFromMemory.length());
    }
    delay(10);
    value = DEVICE_MAC;
    if (reading.indexOf(value) > -1)
    {
        serialCore.send("[ESP-SYS] - DEVICE_MAC: " + WiFi.macAddress());
        this->saveStringInMemory(DEVICE_MAC_DIR, WiFi.macAddress());
        this->deviceMacReadFromMemory = this->readStringFromMemory(DEVICE_MAC_DIR);
        //serialCore.send("[ESP-EEPROM] - EEPROM read at dir [ " + (String)DEVICE_MAC_DIR + " ] ::: " + deviceMacReadFromMemory + " - Size: " + deviceMacReadFromMemory.length());
    }
    delay(10);
    value = MQTT_SERVER;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        serialCore.send("[ESP-SYS] - MQTT_SERVER: " + aux);
        this->saveStringInMemory(MQTT_SERVER_DIR, aux);
        this->readStringFromMemory(MQTT_SERVER_DIR).toCharArray(mqttClient.mqtt_server, 100);
        status.mqttServer = this->readStringFromMemory(MQTT_SERVER_DIR);
        mqttClient.setupMqtt();
        //serialCore.send("[ESP-EEPROM] - EEPROM read at dir [ " + (String)MQTT_SERVER_DIR + " ] ::: " + deviceMacReadFromMemory + " - Size: " + deviceMacReadFromMemory.length());
    }
    delay(10);
    value = MQTT_PORT;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        serialCore.send("[ESP-SYS] - MQTT_PORT: " + aux);
        this->saveStringInMemory(MQTT_PORT_DIR, aux);
        status.mqttPort = this->readStringFromMemory(MQTT_PORT_DIR);
        mqttClient.setupMqtt();
        //serialCore.send("[ESP-EEPROM] - EEPROM read at dir [ " + (String)MQTT_SERVER_DIR + " ] ::: " + deviceMacReadFromMemory + " - Size: " + deviceMacReadFromMemory.length());
    }
    reading = "";
    delay(10);
    digitalWrite(D5, LOW);
}

void Covalent::getStatus()
{
    Weather currentWeather;
    serialCore.send("[ESP-NET] - BOARD: " + MCU);
    status.deviceName = this->readStringFromMemory(DEVICE_NAME_DIR);
    serialCore.send("[ESP-NET] - DEVICE_NAME: " + status.deviceName);
    status.STA_connected = WiFi.isConnected();
    if (status.STA_connected)
    {
        serialCore.send("[ESP-NET] - STA_STATUS_OK");
        this->saveStringInMemory(LOCAL_IP_DIR, WiFi.localIP().toString());
        status.localIp = this->readStringFromMemory(LOCAL_IP_DIR);
        serialCore.send("[ESP-NET] - LOCAL IP: " + status.localIp);
        status.ssid = this->readStringFromMemory(SSID_DIR);
        serialCore.send("[ESP-NET] - STA: " + status.ssid);
        status.mqttServer = this->readStringFromMemory(MQTT_SERVER_DIR);
        if (status.mqttServer = "")
        {
            status.mqttServer = mqttClient.mqtt_server;
            this->saveStringInMemory(MQTT_SERVER_DIR, status.mqttServer);
        }
        serialCore.send("[ESP-NET] - MQTT_SERVER: " + status.mqttServer);
        status.mqttPort = this->readStringFromMemory(MQTT_PORT_DIR);
        serialCore.send("[ESP-NET] - MQTT_PORT: " + status.mqttPort);
        mqttClient.setupMqtt();
    }
    else
    {
        serialCore.send("[ESP-NET] - STA_STATUS_KO");
    }
    status.webServerEnabled = this->readStringFromMemory(WEB_SERVER_STATUS_DIR);
    serialCore.send("[ESP-NET] - WEB_SERVER_STATUS: " + status.webServerEnabled);

    status.ntpEnabled = this->readStringFromMemory(NTP_SERVER_STATUS_DIR);
    if (status.ntpEnabled)
    {
        serialCore.send("[ESP-NTP] - NTP ENABLED");
        timeClient.update();                                                  //sincronizamos con el server NTP
        realHour = timeClient.getFormattedTime().substring(0, 2).toInt() + 5; //+5 para que coja la hora de Madrid
        realMinute = timeClient.getFormattedTime().substring(3, 5).toInt();
        realSec = timeClient.getFormattedTime().substring(6, 8).toInt();
        serialCore.sendInLine("[ESP-NTP] - TIME: ");
        serialCore.sendInLine((String)realHour);
        serialCore.sendInLine(":");
        if (realMinute < 10)
        {
            serialCore.sendInLine("0");
            serialCore.send((String)realMinute);
        }
        else
        {
            serialCore.send((String)realMinute);
        }
    }
    //Enviar fin de lectura
    currentWeather = this->readWeather();
    serialCore.send("[ESP-DHT] - HUM: " + (String)currentWeather.hum);
    serialCore.send("[ESP-DHT] - TEMP: " + (String)currentWeather.temp);
    serialCore.send("[ESP-SYS] - Bluetooth ID is: " + status.bluetoothId);
    serialCore.send("[ESP-SYS] - DEVICE_MAC: " + WiFi.macAddress());
    this->saveStringInMemory(DEVICE_MAC_DIR, WiFi.macAddress());
    status.wifiMac = this->readStringFromMemory(DEVICE_MAC_DIR);
    serialCore.send("[ESP-SYS] - DEVICE_MAC: " + status.wifiMac);
    serialCore.send("[ESP_NET] - STATUS_READ_END");
}

/**********************************************************************************************
 *                                       NETWORK
 **********************************************************************************************/

void Covalent::ConnectWiFi_STA(bool useStaticIP = false, String ssid = "", String password = "")
{
    serialCore.send("[ESP-NET] - Trying to connect to " + ssid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    delay(50);
    serialCore.send("[ESP-NET] - Connection parameters are SSID: " + ssid + " y password " + password);
    delay(100);
    if (useStaticIP)
        WiFi.config(ip, gateway, subnet);
    serialCore.send("[ESP-NET] - GATEWAY and SUBNET established");
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 50)
    {
        attempts++;
        Serial.print(">");
        delay(200);
    }
    serialCore.send("");
    delay(100);

    if (WiFi.isConnected() && ssid)
    {
        serialCore.send("[ESP-NET] - STA: " + ssid);
        serialCore.send("[ESP-NET] - LOCAL IP: " + WiFi.localIP().toString()); // TODO: Debe poder pasarse a string
        status.localIp = WiFi.localIP().toString();
        this->saveStringInMemory(LOCAL_IP_DIR, status.localIp);
        delay(100);
        serialCore.send("[ESP-NET] - WIFI CONNECTION SUCCESS");
        delay(1000);
    }
    else
    {
        delay(2000);
        serialCore.send("[ESP-NET] - WIFI CONNECTION ERROR");
    }
}

void Covalent::renderWebServer()
{
    String header;
    WiFiClient client = webServer.available();
    if (client)
    {
        serialCore.send("New Client.");
        String currentLine = "";
        while (client.connected())
        {
            if (client.available())
            {
                char c = client.read();
                Serial.write(c);
                header += c;
                if (c == '\n')
                {
                    if (currentLine.length() == 0)
                    {
                        client.println("HTTP/1.1 200 OK");
                        client.println("Content-type:text/html");
                        client.println("Connection: close");
                        client.println();
                        // <HTML>
                        client.println("<!DOCTYPE html><html>");

                        // <HEAD>
                        client.println("<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
                        client.println("<link rel=\"icon\" href=\"data:,\">");
                        // --------------- Bootstrap 5.0.0
                        client.println("<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css' integrity='sha384-r4NyP46KrjDleawBgD5tp8Y7UzmLA05oM1iAEQ17CSuDqnUK2+k9luXQOfXJCJ4I' crossorigin='anonymous'>");
                        client.println("<script src='https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js' integrity='sha384-oesi62hOLfzrys4LxRF63OJCXdXDipiYWBnvTl9Y9/TRlw5xlKIEHpNyvvDShgf/' crossorigin='anonymous'></script>");
                        client.println("<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' integrity='sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN' crossorigin='anonymous'>");
                        // --------------- CSS <styles>
                        client.println("<style>");
                        client.println("html{font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;}");
                        client.println(".text-center{ text-align: center; justify-content: center !important;}");
                        client.println(".w-100{width: 100%;}");
                        client.println("</style>");
                        client.println("</head>");
                        // </HEAD>

                        // <BODY>
                        client.println("<body class='row text-center'><div class='card col-lg-4 col-md-4 mt-5'><div class='card-header' style='background-color: black; color: lightgrey;'><h1 class='mt-2'>Base WEB Server</h1></div><div class='card-body'>");
                        client.println("<p>Welocome to your node MCU Web Server. It's time to customize it!</p></div></body></html>");
                        // </BODY>
                        // // </HTML>
                        client.println();
                        break;
                    }
                    else
                    {
                        currentLine = "";
                    }
                }
                else if (c != '\r')
                {
                    currentLine += c;
                }
            }
        }
        header = "";
        // client.stop();
        // delay(50);
        serialCore.send("Client disconnected.");
        delay(100);
        //this->send("[ESP_NET] - WEB SERVER CLOSED");
        delay(100);
        serialCore.send("");
    }
}

/**********************************************************************************************
 *                                       EEPROM
 **********************************************************************************************/

int Covalent::getMemorySize()
{
    return EEPROM.length();
}

void Covalent::clearMemory()
{
    for (int i = 0; i < 1024; i++)
    {
        EEPROM.write(i, 255);
        serialCore.send((String)((int)(((float)((float)i / 1024.00)) * 100)) + "%");
        delay(10);
    }
}

void Covalent::clearMemoryRange(int initPos, int rangeSize)
{
    for (int i = initPos; i < (initPos + rangeSize); i++)
    {
        EEPROM.write(i, 255);
        delay(10);
    }
    serialCore.send("[ESP-EEPROM] - Register ready to write at pos " + (String)initPos + "...");
}

boolean Covalent::saveStringInMemory(int add, String data)
{
    String dataToSave = data;
    serialCore.send("[ESP-EEPROM] - Data to Save: " + dataToSave + " - size: " + dataToSave.length());
    clearMemoryRange(add, 20);
    for (unsigned int i = 0; i < dataToSave.length(); i++)
    {
        EEPROM.write(add + i, dataToSave[i]);
    }
    EEPROM.write(add + dataToSave.length(), 255);
    delay(10);
    EEPROM.commit();
    serialCore.send("[ESP-EEPROM] - " + dataToSave + " >>> Saved in eeprom");
    return true;
}

String Covalent::readStringFromMemory(int pos)
{
    String dataToRead;
    char readChar;
    bool eos = false;
    for (int c = 0; c < 20; c++)
    {
        readChar = EEPROM.read(pos + c);
        delay(10);
        if (readChar != 255 && eos == false)
        {
            dataToRead += (char)readChar;
        }
        else
        {
            eos = true;
        }
    }
    serialCore.send("[ESP-EEPROM] - EEPROM read at dir [ " + (String)pos + " ] ::: " + dataToRead + " - Size: " + (String)dataToRead.length());
    return dataToRead;
}

/***************************************** NTP ***********************************************/

void Covalent::ntp()
{
    timeClient.update();
    status.ntpData = "";                                                  //sincronizamos con el server NTP
    realHour = timeClient.getFormattedTime().substring(0, 2).toInt() + 4; //+5 para que coja la hora de Madrid
    realMinute = timeClient.getFormattedTime().substring(3, 5).toInt();
    realSec = timeClient.getFormattedTime().substring(6, 8).toInt();
    serialCore.sendInLine("[ESP-NTP] - TIME: ");
    serialCore.sendInLine((String)realHour);
    status.ntpData += (String)realHour;
    serialCore.sendInLine(":");
    status.ntpData += ":";
    if (realMinute < 10)
    {
        serialCore.sendInLine("0");
        status.ntpData += "0";
        serialCore.send((String)realMinute);
        status.ntpData += (String)realMinute;
    }
    else
    {
        serialCore.send((String)realMinute);
        status.ntpData += (String)realMinute;
    }
    delay(10);
}
/************************************************************************************************/

/**********************************************************************************************
 *                                       DHT
 **********************************************************************************************/
Weather Covalent::readWeather()
{
    Weather weather;
    weather.hum = dht.readHumidity();
    weather.temp = dht.readTemperature();
    if (isnan(weather.hum) || isnan(weather.temp))
    {
        serialCore.send("Failed to read from DHT sensor!");
    }
    else
    {
        status.temperature = weather.temp;
        status.humidity = weather.hum;
    }
    return weather;
}