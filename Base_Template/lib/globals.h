
// Este identificador debe cambiar para cada versión de placa. No 
// debe ser modificable desde la aplicación y por eso no se habilita campo en eeprom para él,
// puesto que se encuentra en la memoria de programa
const String MCU = "NodeMCU v3.0 - ESP8266";
#define _GMT 2

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
#define DEVICE_TYPE ">>>DEVICE_TYPE: " 

/*-------------VARIABLES DE CLIMA DHT11----------------*/
#define DHTPIN D3   // what pin we're connected to
#define DHTTYPE DHT11   // DHT 22  (AM2302)

/* DIRECCIONES DE MEMORIA EEEPROM */
const int USER1_CODE_DIR = 0;
const int USER2_CODE_DIR = 4;
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
const int DEVICE_TYPE_DIR = 174; // Size 16
const int D0_BH_DIR = 190; // Size 1
const int D1_BH_DIR = 191; // Size 1
const int D2_BH_DIR = 192; // Size 1
const int D3_BH_DIR = 193; // Size 1
const int D4_BH_DIR = 194; // Size 1
const int D5_BH_DIR = 195; // Size 1
const int D6_BH_DIR = 196; // Size 1
const int D7_BH_DIR = 197; // Size 1
const int D8_BH_DIR = 198; // Size 1
const int D9_BH_DIR = 199; // Size 1
const int D10_BH_DIR = 200; // Size 1

// Not used from 201 - 209 ()

const int D0_STATUS_DIR = 210; // Size 1
const int D1_STATUS_DIR = 211; // Size 1
const int D2_STATUS_DIR = 212; // Size 1
const int D3_STATUS_DIR = 213; // Size 1
const int D4_STATUS_DIR = 214; // Size 1
const int D5_STATUS_DIR = 215; // Size 1
const int D6_STATUS_DIR = 216; // Size 1
const int D7_STATUS_DIR = 217; // Size 1
const int D8_STATUS_DIR = 218; // Size 1
const int D9_STATUS_DIR = 219; // Size 1
const int D10_STATUS_DIR = 220; // Size 1


/*************FIELD SIZES***************/

const int USER1_CODE_SIZE = 4;
const int USER2_CODE_SIZE = 6;
/**
 *                 DIR8 DIR9 TYPE
 *                  0    0   BASE (No peripherals)
 *                  0    1   MOVEMENT_DETECTOR
 *                  0    2   SINGLE RELAY OUTPUT
 *                  0    3   DOUBLE RELAY + 12V OUTPUT 
 *                  0    4   CAMERA
 */
const int DEVICE_NAME_SIZE = 10; //Size: 10
const int LOCAL_IP_SIZE = 16;    //Size: 16
const int WEB_SERVER_STATUS_SIZE = 1; //Size: 1---> Value: 1 ENABLED - 0 DISABLED
const int NTP_SERVER_STATUS_SIZE = 1; //Size: 1---> Value: 1 ENABLED - 0 DISABLED
const int SSID_SIZE = 20;        // Size:20
const int WIFI_PASS_SIZE = 20;   //Size: 20
const int BT_ID_SIZE = 20;   //Size: 20
const int DEVICE_MAC_SIZE = 20;   //Size: 20
const int MQTT_SERVER_SIZE = 30;   //Size: 30
const int MQTT_PORT_SIZE = 4;   //Size: 4
const int DEVICE_TYPE_SIZE = 16; // Size 16
const int D0_BH_SIZE = 1; // Size 1
const int D1_BH_SIZE = 1; // Size 1
const int D2_BH_SIZE = 1; // Size 1
const int D3_BH_SIZE = 1; // Size 1
const int D4_BH_SIZE = 1; // Size 1
const int D5_BH_SIZE = 1; // Size 1
const int D6_BH_SIZE = 1; // Size 1
const int D7_BH_SIZE = 1; // Size 1
const int D8_BH_SIZE = 1; // Size 1
const int D9_BH_SIZE = 1; // Size 1
const int D10_BH_SIZE = 1; // Size 1

// Not used from 201 - 209 ()

const int D0_STATUS_SIZE = 1; // Size 1
const int D1_STATUS_SIZE = 1; // Size 1
const int D2_STATUS_SIZE = 1; // Size 1
const int D3_STATUS_SIZE = 1; // Size 1
const int D4_STATUS_SIZE = 1; // Size 1
const int D5_STATUS_SIZE = 1; // Size 1
const int D6_STATUS_SIZE = 1; // Size 1
const int D7_STATUS_SIZE = 1; // Size 1
const int D8_STATUS_SIZE = 1; // Size 1
const int D9_STATUS_SIZE = 1; // Size 1
const int D10_STATUS_SIZE = 1; // Size 1

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
    String deviceType;
    int deviceTypeCode;
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
    boolean D6;
    boolean D5;
    boolean D4;
    boolean D6_behaviour;
    boolean D5_behaviour;
    boolean D4_behaviour;
    boolean alarmStatus;
    boolean alarmTriggered;
};


enum deviceTypes {
  Volumetrico,
  Custom
};

