import { IMqttServiceOptions } from 'ngx-mqtt/lib/mqtt.model';

export let MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
    hostname: 'test.mosquitto.org',
    port: 8080, //Es el puerto sin seguridad para conexión mediante sockets
    path: '/mqtt'
  }