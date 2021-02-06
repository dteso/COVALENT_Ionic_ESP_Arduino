
// Este identificador debe cambiar para cada versión de placa. No 
// debe ser modificable desde la aplicación y por eso no se habilita campo en eeprom para él,
// puesto que se encuentra en la memoria de programa
const String MCU = "NodeMCU v3.0 - ESP8266";
#define _GMT 1

/* MENSAJES */
#define APP_DATA "APP-DATA >>>"
#define WIFI_SSID ">>>WIFI_SSID: "
#define WIFI_PASS ">>>WIFI_PASS: "
#define DEVICE_NAME ">>>DEVICE_NAME: "
#define DEVICE_MAC ">>>DEVICE_MAC: "
#define EEPROM_RESET "MEM_RST"
#define CREATE_WEB_SERVER "CREATE_WEB_SERVER"
#define ENABLE_NTP "ENABLE_NTP"
#define CLOSE_WEB_SERVER "CLOSE_WEB_SERVER"
#define BLUETOOTH_CONNECTED "BLUETOOTH CONNECTED"
#define DISABLE_NTP "DISABLE_NTP"
#define READ_STATUS ">>>READ_STATUS"
#define READ_WEATHER ">>>READ_WEATHER"
#define READ_BT_ID "[ESP-SYS] - BT_ID QUERY"
#define BLUETOOTH_ID ">>>BLUETOOTH_ID: " 
#define MQTT_SERVER ">>>MQTT_SERVER: " 
#define MQTT_PORT ">>>MQTT_PORT: " 

/*-------------VARIABLES DE CLIMA DHT11----------------*/
#define DHTPIN D3   // what pin we're connected to
#define DHTTYPE DHT11   // DHT 22  (AM2302)

/* DIRECCIONES DE MEMORIA EEEPROM */
const int USER1_CODE_DIR = 0;
const int USER2_CODE_DIR = 4;
const int DEVICE_TYPE = 8; // Size 2
/**
 *                 DIR8 DIR9 TYPE
 *                  0    0   BASE (No peripherals)
 *                  0    1   MOVEMENT_DETECTOR
 *                  0    2   SINGLE RELAY OUTPUT
 *                  0    3   DOUBLE RELAY + 12V OUTPUT 
 *                  0    4   CAMERA
 */
const int DEVICE_NAME_DIR = 10; //Size: 10
const int LOCAL_IP_DIR = 20;    //Size: 16
const int WEB_SERVER_STATUS_DIR = 37; //Size: 1---> Value: 1 ENABLED - 0 DISABLED
const int NTP_SERVER_STATUS_DIR = 38; //Size: 1---> Value: 1 ENABLED - 0 DISABLED
const int SSID_DIR = 60;        // Size:20
const int WIFI_PASS_DIR = 80;   //Size: 20
const int BT_ID_DIR = 100;   //Size: 20
const int DEVICE_MAC_DIR = 120;   //Size: 20
const int MQTT_SERVER_DIR = 140;   //Size: 30
const int MQTT_PORT_DIR = 170;   //Size: 4



/*STRUCT STATUS*/

struct Weather
{
    float hum;
    float temp;
};

struct Status
{
    int user1_code[4];
    int user2_code[4];
    int deviceType;
    String deviceName;
    String scenario;
    String bluetoothId;
    String wifiMac;
    String localIp;
    String ssid;
    boolean STA_connected;
    boolean btEnabled;
    boolean ntpEnabled;
    String webServerEnabled;
    String ntpData;
    String temperature;
    String humidity;
    String mqttServer;
    String mqttPort;
};


