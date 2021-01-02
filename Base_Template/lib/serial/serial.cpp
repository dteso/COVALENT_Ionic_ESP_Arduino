#include "serial.hpp"

SerialCore::SerialCore() {}
/**********************************************************************************************
 *                                 SERIAL COMMUNICATIONS
 **********************************************************************************************/
void SerialCore::beginBT(int baudRate, SoftwareSerialConfig config, int rx, int tx, boolean flag, int bufferSize)
{
    BTserial.begin(baudRate, config, rx, tx, flag, bufferSize);
}

String SerialCore::readBT()
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
        String result = btReading;
        btReading="";
        //this->send("Result: " + result);
        return result;
    }
    return "";
}

String SerialCore::readSerial()
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
        String result = serialReading;
        serialReading="";
        //this->send("Result: " + result);
        return result;
    }
    return "";
}

void SerialCore::send(String message)
{
    Serial.println(message);
    BTserial.println(message);
}

void SerialCore::sendInLine(String message)
{
    Serial.print(message);
    BTserial.print(message);
}
