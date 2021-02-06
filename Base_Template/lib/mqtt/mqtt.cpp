#include "mqtt.hpp"

//const char *mqtt_server = "test.mosquitto.org";

WiFiClient espClient;
PubSubClient client(espClient);
String response;
String topicResponse;
String payloadData;
String topicData;
String deviceName;
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
    serialcore.send("] ");
    for (unsigned int i = 0; i < length; i++)
    {
        char c = ((char)payload[i]);
        response = response + c;
    }
    serialcore.sendInLine("Topic:" + (String)topic);
    serialcore.send("");
    serialcore.sendInLine("Respuesta:" + response);
    serialcore.send("");
    payloadData = response;
    topicResponse = (String)topic;
    response = "";
}

/*
 * Método de conexión recursiva a Servidor Mosquitto
 */
void Mqtt::reconnect(boolean restart)
{
    // Forces restart after change device name which is a part of a topic name to subscribe
    // this is because we've to reconnect
    if(restart){
        client.disconnect();
    }
    // Loop until we're reconnected
    while (!client.connected())
    {
        serialcore.sendInLine("Attempting MQTT connection...");
        // Create a random client ID
        String clientId = "ESP8266Client-";
        clientId += String(random(0xffff), HEX);
        if (client.connect(clientId.c_str()))
        {
            serialcore.send("connected");
            // SUCCESSFULLY CONNECTION ADVICE
            client.publish("medusa/network/status", ">>>...M E D U S A  is now  A L I V E...>>> \n");
            client.publish("medusa/network/connections", WiFi.localIP().toString().c_str());
            // GENERAL TOPIC SUBSCRIPTION
            client.subscribe("medusa/devices/outputs");
            // DEVICE SUBSCRIPTION ( topic where we'll get commands to manage )
            if (deviceName != "")
            {
                char commandsTopic[200] = "";
                String ownTopic = "medusa/set/" + deviceName;
                ownTopic.toCharArray(commandsTopic, 100);
                client.subscribe(commandsTopic);
            }
        }
        else
        {
            serialcore.sendInLine("failed, rc=");
            serialcore.sendInLine((String)client.state());
            serialcore.sendInLine(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void Mqtt::publishFloatValue(char topic[], float value)
{
    if (client.connected())
    {
        snprintf(msg, 50, " %.2f", value);
        client.publish(topic, msg);
    }
}

void Mqtt::publishString(char topic[], char value[])
{
    if (client.connected())
    {
        client.publish(topic, value);
    }
}

void Mqtt::subscribeTo(char topic[])
{
    if (client.connected())
    {
        client.subscribe(topic);
    }
}

void Mqtt::setupMqtt()
{
    if (client.connected())
    {
        client.disconnect();
    }
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
}

void Mqtt::mqtt_loop()
{
    data = payloadData;
    lastTopic = topicResponse;
    payloadData = "";
    topicResponse = "";
    if (!client.connected())
    {
        reconnect(false);
    }
    client.loop();
}
