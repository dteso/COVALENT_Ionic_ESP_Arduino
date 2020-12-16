
#include "covalent.h"

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

Covalent::Covalent() {}

void Covalent::setup()
{
    pinMode(D4, OUTPUT);
    pinMode(D5, OUTPUT);
    this->beginBT(this->BT_BAUDRATE, SWSERIAL_8N1, 13, 15, false, 256);
    Serial.begin(this->SERIAL_BAUDRATE);
    EEPROM.begin(this->EEPROM_SIZE);
    this->WEB_SERVER_ENABLED = this->readStringFromMemory(WEB_SERVER_STATUS_DIR).indexOf("1") > -1 ? true : false;
    this->NTP_SERVER_ENABLED = true;
    this->saveStringInMemory(NTP_SERVER_STATUS_DIR, "1");
}

void Covalent::loop()
{
    this->readSerial();
    this->readBT();
    if (this->WEB_SERVER_ENABLED)
    {
        this->renderWebServer();
    }
    this->ntp();
}

/**********************************************************************************************
 *                                       UTILS
 **********************************************************************************************/

void Covalent::verifyCommands(String reading)
{
    digitalWrite(D5, HIGH);
    this->send(reading);

    String value = WIFI_SSID;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        this->send("[ESP_SERIAL] - WiFi SSID is " + aux);
        this->saveStringInMemory(SSID_DIR, aux);
        aux = "";
        this->SSIDreadFromMemory = this->readStringFromMemory(SSID_DIR);
        this->send("[ESP-EEPROM] - EEPROM read at dir [ " + (String)SSID_DIR + " ] ::: " + SSIDreadFromMemory + " - Size: " + SSIDreadFromMemory.length());
    }
    delay(10);
    value = WIFI_PASS;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        boolean readCompleted = false;
        aux = reading.substring(value.length(), reading.length());
        this->send("[ESP_SERIAL] - WiFi Password is " + aux);
        readCompleted = this->saveStringInMemory(WIFI_PASS_DIR, aux);
        if (!readCompleted)
        {
            this->send("[ESP-EEPROM] - " + aux + " >>> Saved in eeprom");
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
        this->send("[ESP_SERIAL] - Message received with content... " + aux);
        aux = "";
    }
    delay(10);
    value = EEPROM_RESET;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        this->send("[ESP_SERIAL] - Message received with content... " + aux);
        this->send("[ESP-EEPROM] - Formatting EEPROM. Please wait...");
        this->clearMemory();
        this->send("[ESP-EEPROM] - Memory formatted");
        // Decidimos desconectar el WiFi cuando se borre la EEPROM obligando a reconectar
        // y que no haya parámetros inválidos en memoria
        WiFi.disconnect();
        this->send("[ESP-NET] - STA_STATUS: KO");
        aux = "";
    }
    delay(10);
    value = CREATE_WEB_SERVER;
    if (reading.indexOf(value) > -1)
    {
        String aux;
        aux = reading.substring(value.length(), reading.length());
        this->send("[ESP_SERIAL] - Message received with content... " + aux);
        this->send("[ESP_NET] - WEB SERVER ENABLED");
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
        this->send("[ESP_SERIAL] - Message received with content... " + aux);
        this->send("[ESP_NET] - WEB SERVER CLOSED");
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
        this->send("[ESP_SERIAL] - Message received with content... " + aux);
        this->send("[ESP_NTP] - NTP ENABLED");
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
        this->send("[ESP_SERIAL] - Message received with content... " + aux);
        this->send("[ESP_NTP] - NTP DISABLED");
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
        this->send("[ESP_SERIAL] - Message received with content... " + aux);
        this->send("[ESP_NET] - STATUS_READ_START");
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
        this->send("[ESP_SERIAL] - Message received with content... " + aux);
        this->send("[ESP_NET] - WEATHER_READ_START");
        currentWeather = this->readWeather();
        this->send("[ESP-DHT] - HUM: " + (String)currentWeather.hum);
        this->send("[ESP-DHT] - TEMP: " + (String)currentWeather.temp);
        aux = "";
    }
    reading = "";
    delay(10);
    digitalWrite(D5, LOW);
}

void Covalent::getStatus()
{
    Status status;
    Weather currentWeather;
    this->send("[ESP-NET] - BOARD: " + MCU);
    status.deviceName = this->readStringFromMemory(DEVICE_NAME_DIR);
    this->send("[ESP-NET] - DEVICE_NAME: " + status.deviceName);
    status.STA_connected = WiFi.isConnected();
    if (status.STA_connected)
    {
        this->send("[ESP-NET] - STA_STATUS_OK");
        status.localIp = this->readStringFromMemory(LOCAL_IP_DIR);
        this->send("[ESP-NET] - LOCAL IP: " + status.localIp);
        status.ssid = this->readStringFromMemory(SSID_DIR);
        this->send("[ESP-NET] - STA: " + status.ssid);
    }
    else
    {
        this->send("[ESP-NET] - STA_STATUS_KO");
    }
    status.webServerEnabled = this->readStringFromMemory(WEB_SERVER_STATUS_DIR);
    this->send("[ESP-NET] - WEB_SERVER_STATUS: " + status.webServerEnabled);

    status.ntpEnabled = this->readStringFromMemory(NTP_SERVER_STATUS_DIR);
    if (status.ntpEnabled)
    {
        this->send("[ESP-NTP] - NTP ENABLED");
        timeClient.update();                                                  //sincronizamos con el server NTP
        realHour = timeClient.getFormattedTime().substring(0, 2).toInt() + 5; //+5 para que coja la hora de Madrid
        realMinute = timeClient.getFormattedTime().substring(3, 5).toInt();
        realSec = timeClient.getFormattedTime().substring(6, 8).toInt();
        this->sendInLine("[ESP-NTP] - TIME: ");
        this->sendInLine((String)realHour);
        this->sendInLine(":");
        if (realMinute < 10)
        {
            this->sendInLine("0");
            this->send((String)realMinute);
        }
        else
        {
            this->send((String)realMinute);
        }
    }
    //Enviar fin de lectura
    currentWeather = this->readWeather();
    this->send("[ESP-DHT] - HUM: " + (String)currentWeather.hum);
    this->send("[ESP-DHT] - TEMP: " + (String)currentWeather.temp);
    this->send("[ESP_NET] - STATUS_READ_END");
}

/**********************************************************************************************
 *                                 SERIAL COMMUNICATIONS
 **********************************************************************************************/
void Covalent::beginBT(int baudRate, SoftwareSerialConfig config, int rx, int tx, boolean flag, int bufferSize)
{
    BTserial.begin(baudRate, config, rx, tx, flag, bufferSize);
}

void Covalent::readBT()
{
    digitalWrite(D4, HIGH);
    String btReading;
    while (BTserial.available()) //Check if there is an available byte to read
    {
        digitalWrite(D4, LOW);
        delay(10);
        char c = BTserial.read(); //Conduct a serial read
        if (c == '\n')
        {
            break;
        }
        else
        {
            btReading += c; //Shorthand for reading = reading + c
            digitalWrite(D4, HIGH);
        }
    }

    if (btReading.length() > 0)
    {
        verifyCommands(btReading);
        btReading = "";
    }
}

void Covalent::readSerial()
{
    digitalWrite(D4, LOW);
    String serialReading;
    while (Serial.available()) //Check if there is an available byte to read
    {
        delay(10);              //Delay added to make thing stable
        char d = Serial.read(); //Conduct a serial read
        if (d == '\n')
        {
            break;
        }
        serialReading += d; //Shorthand for reading = reading + c
        digitalWrite(D4, HIGH);
    }

    if (serialReading.length() > 0)
    {
        verifyCommands(serialReading);
    }
}

void Covalent::send(String message)
{
    Serial.println(message);
    BTserial.println(message);
}

void Covalent::sendInLine(String message)
{
    Serial.print(message);
    BTserial.print(message);
}

/**********************************************************************************************
 *                                       NETWORK
 **********************************************************************************************/

void Covalent::ConnectWiFi_STA(bool useStaticIP = false, String ssid = "", String password = "")
{
    this->send("[ESP-NET] - Trying to connect to " + ssid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    delay(50);
    this->send("[ESP-NET] - Connection parameters are SSID: " + ssid + " y password " + password);
    delay(100);
    if (useStaticIP)
        WiFi.config(ip, gateway, subnet);
    this->send("[ESP-NET] - GATEWAY and SUBNET established");
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 50)
    {
        attempts++;
        Serial.print(">");
        delay(200);
    }
    this->send("");
    delay(100);

    if (WiFi.isConnected() && ssid)
    {
        this->send("[ESP-NET] - STA: " + ssid);
        this->send("[ESP-NET] - LOCAL IP: " + WiFi.localIP().toString()); // TODO: Debe poder pasarse a string
        this->saveStringInMemory(LOCAL_IP_DIR, WiFi.localIP().toString());
        delay(100);
        this->send("[ESP-NET] - WIFI CONNECTION SUCCESS");
        delay(1000);
    }
    else
    {
        delay(2000);
        this->send("[ESP-NET] - WIFI CONNECTION ERROR");
    }
}

void Covalent::renderWebServer()
{
    String header;
    WiFiClient client = webServer.available();
    if (client)
    {
        this->send("New Client.");
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
        this->send("Client disconnected.");
        delay(100);
        //this->send("[ESP_NET] - WEB SERVER CLOSED");
        delay(100);
        this->send("");
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
        this->send((String)((int)(((float)((float)i / 1024.00)) * 100)) + "%");
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
    this->send("[ESP-EEPROM] - Register ready to write at pos " + (String)initPos + "...");
}

boolean Covalent::saveStringInMemory(int add, String data)
{
    String dataToSave = data;
    this->send("[ESP-EEPROM] - Data to Save: " + dataToSave + " - size: " + dataToSave.length());
    clearMemoryRange(add, 20);
    for (int i = 0; i < dataToSave.length(); i++)
    {
        EEPROM.write(add + i, dataToSave[i]);
    }
    EEPROM.write(add + dataToSave.length(), 255);
    delay(10);
    EEPROM.commit();
    this->send("[ESP-EEPROM] - " + dataToSave + " >>> Saved in eeprom");
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
    this->send("[ESP-EEPROM] - EEPROM read at dir [ " + (String)pos + " ] ::: " + dataToRead + " - Size: " + (String)dataToRead.length());
    return dataToRead;
}

/***************************************** NTP ***********************************************/
boolean printNtpStatus = false;

void Covalent::ntp()
{
    timeClient.update();                                                  //sincronizamos con el server NTP
    realHour = timeClient.getFormattedTime().substring(0, 2).toInt() + 5; //+5 para que coja la hora de Madrid
    realMinute = timeClient.getFormattedTime().substring(3, 5).toInt();
    realSec = timeClient.getFormattedTime().substring(6, 8).toInt();
    if (realSec == 0 && !printNtpStatus)
    {
        printNtpStatus = true;
        this->sendInLine("[ESP-NTP] - TIME: ");
        this->sendInLine((String)realHour);
        this->sendInLine(":");
        if (realMinute < 10)
        {
            this->sendInLine("0");
            this->send((String)realMinute);
        }
        else
        {
            this->send((String)realMinute);
        }
        delay(10);
    }
    else if (realSec > 0)
    {
        printNtpStatus = false;
    }
    delay(50);
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
        this->send("Failed to read from DHT sensor!");
    }
    return weather;
}