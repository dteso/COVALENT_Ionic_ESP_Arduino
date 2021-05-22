#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

String ApiHost = "http://192.168.1.136:3000";


void processResponse(int httpCode, HTTPClient& http)
{
	if (httpCode > 0) {
		Serial.printf("Response code: %d\t", httpCode);

		if (httpCode == HTTP_CODE_OK) {
			String payload = http.getString();
			Serial.println(payload);
		}
	}
	else {
		Serial.printf("Request failed, error: %s\n", http.errorToString(httpCode).c_str());
	}
	http.end();
}


void post()
{
    Serial.println("POST EJECUTADO");
	HTTPClient http;
	http.begin(ApiHost + "/dispatcher/alarm");
	int httpCode = http.POST("ALARM");
	processResponse(httpCode, http);
}