
#ifndef MQTT_H
#define MQTT_H

#include <Arduino.h>
#include <SoftwareSerial.h>
#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <serial.hpp>

class Mqtt
{
public:

    String data;
    String lastTopic;
    String deviceName;
    String wifiMAC;
    String tokenizedTopic;
    char *mqtt_server= "test.mosquitto.org";

    Mqtt();

    //Mqtt methods Communications
    void reconnect(boolean restart);
    void publishFloatValue(char topic[], float value);
    void publishString(char topic[], char []);
    void subscribeTo(char topic[]);
    void setupMqtt();
    void mqtt_loop();
    void setData();

private:



};

#endif

