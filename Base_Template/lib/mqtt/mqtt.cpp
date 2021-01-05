#include "mqtt.hpp"

const char *mqtt_server = "test.mosquitto.org";

WiFiClient espClient;
PubSubClient client(espClient);
String response;
char msg[50];

SerialCore serialcore;

Mqtt::Mqtt() {}
/*
 * Método de lectura de mensajes Mosquitto como cliente 
 */
void callback(char *topic, byte *payload, unsigned int length)
{
    serialcore.sendInLine("Message arrived [");
    serialcore.sendInLine(topic);
    serialcore.sendInLine("] ");
    for (int i = 0; i < length; i++)
    {
        char c = ((char)payload[i]);
        response = response + c;
    }
    serialcore.sendInLine("Respuesta:" + response);
    serialcore.sendInLine("");

    // Switch on the LED if an 1 was received as first character
    if (response == "OFF")
    {
        digitalWrite(D5, LOW);
        response = "";
    }
    else if (response = "ON")
    {
        digitalWrite(D5, HIGH);
        response = "";
    }
}

/*
 * Método de conexión recursiva a Servidor Mosquitto
 */
void Mqtt::reconnect()
{
    // Loop until we're reconnected
    while (!client.connected())
    {
        serialcore.sendInLine("Attempting MQTT connection...");
        // Create a random client ID
        String clientId = "ESP8266Client-";
        clientId += String(random(0xffff), HEX);
        // Attempt to connect
        if (client.connect(clientId.c_str()))
        {
            serialcore.sendInLine("connected");
            // Once connected, publish an announcement...
            //Le decimos al broker que estamos aqui y somos un cliente con una IP especifica publicando en el canal /network/connections
            client.publish("medusa/network/status", ">>>...M E D U S A  is now  A L I V E...>>> \n");
            client.publish("medusa/network/connections", WiFi.localIP().toString().c_str());

            //Variable de SENSOR que se PUBLICA
            client.publish("medusa/devices/temperatura", WiFi.localIP().toString().c_str());
            client.publish("medusa/devices/temperatura", "ha empezado a publicar en TOPIC temperatura\n");
            client.publish("medusa/devices/humedad", WiFi.localIP().toString().c_str());
            client.publish("medusa/devices/humedad", "ha empezado a publicar en TOPIC humedad\n");

            // ... and resubscribe
            //Variable con conando para ACTUADOR que se SUSCRIBE
            client.subscribe("medusa/devices/outputs");
        }
        else
        {
            serialcore.sendInLine("failed, rc=");
            serialcore.sendInLine((String)client.state());
            serialcore.sendInLine(" try again in 5 seconds");
            // Wait 5 seconds before retrying
            delay(5000);
        }
    }
}

void Mqtt::publishFloatValue(char topic[], float temperatura)
{
    if (client.connected())
    {
        snprintf(msg, 50, " %.2f ºC", temperatura);
        serialcore.sendInLine("Publish message: ");
        delay(10);
        serialcore.send(msg);
        delay(10);
        client.publish(topic, msg);
    }
}

void Mqtt::setupMqtt()
{
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
}

void Mqtt::mqtt_loop(){
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
