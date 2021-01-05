
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

    Mqtt();

    //Mqtt methods Communications
    void reconnect();
    void publishFloatValue(char topic[], float temperatura);
    void setupMqtt();
    void mqtt_loop();

private:

};

#endif

