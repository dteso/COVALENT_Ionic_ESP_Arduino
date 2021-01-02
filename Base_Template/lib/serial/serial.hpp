#ifndef SERIAL_H
#define SERIAL_H

#include <Arduino.h>
#include <SoftwareSerial.h>

class SerialCore
{

public:
    const int EEPROM_SIZE = 4096;
    const int SERIAL_BAUDRATE = 115200;
    const int BT_BAUDRATE = 9600;
    SoftwareSerial BTserial;

    SerialCore();

    //Serial Communications
    void beginBT(int, SoftwareSerialConfig, int, int, boolean, int);
    String readBT();
    String readSerial();
    void send(String);
    void sendInLine(String);

private:

};

#endif