
#include "covalent.h"
#include <serial.hpp>
#include <mqtt.hpp>
#include "myoled.cpp"

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

Covalent::Covalent() {}

void Covalent::setup()
{
    pinMode(D4, OUTPUT);
    pinMode(D5, OUTPUT);
    serialCore.beginBT(serialCore.BT_BAUDRATE, SWSERIAL_8N1, 13, 15, false, 256);
    Serial.begin(serialCore.SERIAL_BAUDRATE);
    EEPROM.begin(this->EEPROM_SIZE);
    dht.begin();
    this->WEB_SERVER_ENABLED = this->readStringFromMemory(WEB_SERVER_STATUS_DIR).indexOf("1") > -1 ? true : false;
    this->NTP_SERVER_ENABLED = true;
    this->saveStringInMemory(NTP_SERVER_STATUS_DIR, "1");
    loadingScreen();
    display.clearDisplay();                                        //for Clearing the display
    display.drawBitmap(0, 0, medusaka_logoBitmap, 128, 64, WHITE); // display.drawBitmap(x position, y position, bitmap data, bitmap width, bitmap height, color)
    display.display();
    mqttClient.setupMqtt();
    this->ntp();
}

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

    if (lastSec != this->realSec)
    {
        lastSec = this->realSec;
        blink = true;
    }
    else
    {
        blink = false;
    }

    if ((blink) && (this->realSec == 2 || this->realSec == 3 || this->realSec == 4 || this->realSec == 10 || this->realSec == 11 || this->realSec == 13 || this->realSec == 16 || this->realSec == 20 || this->realSec == 21 || this->realSec == 25 || this->realSec == 26 || this->realSec == 30 || this->realSec == 34 || this->realSec == 37 || this->realSec == 49 || this->realSec == 51 || this->realSec == 57 || this->realSec == 58 || this->realSec == 59))
    {
        blink = false;
        display.clearDisplay();                                         //for Clearing the display
        display.drawBitmap(0, 0, medusaka_logoBitmap2, 128, 64, WHITE); // display.drawBitmap(x position, y position, bitmap data, bitmap width, bitmap height, color)
        display.display();
        delay(70);
        display.clearDisplay();                                        //for Clearing the display
        display.drawBitmap(0, 0, medusaka_logoBitmap, 128, 64, WHITE); // display.drawBitmap(x position, y position, bitmap data, bitmap width, bitmap height, color)
        display.display();
    }
    mqttClient.mqtt_loop();
    this->reloj();
}

/**********************************************************************************************
 *                                       UTILS
 **********************************************************************************************/

/*-------------VARIABLES DE TIEMPO---------------------*/
int newValue;
int currentValue;
int sec = 0, mn = 0, hor = 0;
/*******************************************************/

void Covalent::reloj()
{
    newValue = (millis() / 1000);
    if (newValue != currentValue)
    {
        currentValue = newValue;
        // +1 SEGUNDO
        sec++;
        if (sec == 60)
        {
            sec = 0;
            // +1 MINUTO
            mn++;
            mqttClient.publishFloatValue("medusa/devices/temperatura", this->readWeather().temp);
            mqttClient.publishFloatValue("medusa/devices/humedad", this->readWeather().hum);
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
        // serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        aux = "";
    }
    delay(10);
    value = EEPROM_RESET;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        // serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        serialCore.send("[ESP-EEPROM] - Formatting EEPROM. Please wait...");
        this->clearMemory();
        serialCore.send("[ESP-EEPROM] - Memory formatted");
        // Decidimos desconectar el WiFi cuando se borre la EEPROM obligando a reconectar
        // y que no haya parámetros inválidos en memoria
        WiFi.disconnect();
        serialCore.send("[ESP-NET] - STA_STATUS: KO");
        aux = "";
    }
    delay(10);
    value = CREATE_WEB_SERVER;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        // serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        serialCore.send("[ESP_NET] - WEB SERVER ENABLED");
        WEB_SERVER_ENABLED = true;
        this->saveStringInMemory(WEB_SERVER_STATUS_DIR, "1");
        webServer.begin();
        delay(100);
        aux = "";
    }
    delay(10);
    value = CLOSE_WEB_SERVER;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        // serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        serialCore.send("[ESP_NET] - WEB SERVER CLOSED");
        WEB_SERVER_ENABLED = false;
        this->saveStringInMemory(WEB_SERVER_STATUS_DIR, "0");
        webServer.close();
        aux = "";
    }
    delay(10);
    value = ENABLE_NTP;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        // serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        serialCore.send("[ESP_NTP] - NTP ENABLED");
        NTP_SERVER_ENABLED = true;
        this->saveStringInMemory(NTP_SERVER_STATUS_DIR, "1");
        //webServer.begin();
        delay(100);
        aux = "";
    }
    delay(10);
    value = DISABLE_NTP;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        // serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        serialCore.send("[ESP_NTP] - NTP DISABLED");
        NTP_SERVER_ENABLED = false;
        this->saveStringInMemory(NTP_SERVER_STATUS_DIR, "0");
        //webServer.close();
        aux = "";
    }
    delay(10);
    value = READ_STATUS;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        // serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        serialCore.send("[ESP_NET] - STATUS_READ_START");
        this->getStatus();
        aux = "";
    }
    delay(10);
    value = READ_WEATHER;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        Weather currentWeather;
        aux = reading.substring(value.length(), reading.length());
        // serialCore.send("[ESP_SERIAL] - Message received with content... " + aux);
        serialCore.send("[ESP_NET] - WEATHER_READ_START");
        currentWeather = this->readWeather();
        serialCore.send("[ESP-DHT] - HUM: " + (String)currentWeather.hum);
        serialCore.send("[ESP-DHT] - TEMP: " + (String)currentWeather.temp);
        aux = "";
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
        status.localIp = this->readStringFromMemory(LOCAL_IP_DIR);
        serialCore.send("[ESP-NET] - LOCAL IP: " + status.localIp);
        status.ssid = this->readStringFromMemory(SSID_DIR);
        serialCore.send("[ESP-NET] - STA: " + status.ssid);
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
        this->saveStringInMemory(LOCAL_IP_DIR, WiFi.localIP().toString());
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
    for (int i = 0; i < dataToSave.length(); i++)
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
    return weather;
}