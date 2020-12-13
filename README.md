# COVALENT ( Ionic + NodeMCU ESP8266 + Arduino controller )
Covalente surge de la necesidad de llevar a cabo la opción de aportar las configuraciones necesarias a nuestros disporitivos IOT de forma continua a lo largo de todo un proyecto, sin necesidad de modificar nuestro código inicial, sino estableciendo nuestras condiciones dinámicamente en función del entorno en el que nos encontremos en cada momento gracias a la app Covalent.

La idea es sencilla. Se trata de llevarnos nuestro proyecto Base_Template a nuestra placa ( en este momento sólo probado con nodeMCU ).

Una vez volcado el programa en nuestro controlador, simplemente haciendo uso de la aplicación Covalente vamos a poder:

- Logar nuestro micro y conectarlo a Internet aportando únicamente nuestra SSID y password de la misma. De esta forma, por ejemplo, cuando no estemos en red local, podremos habilitar en nuestro movil un punto de acceso que simule una red wifi que permita que nuestro node funcione en todo su explendor. 

- Control absoluto de la EEPROM de nuestro dispositivo con capacidad de operación plena sobre ella. 

- Terminal de comunicaciones serie tanto para el puerto USB de nuestro dispositivo móvil como para una posible conexión bluetooth. 

- Sincronización del tiempo mediante NTP. Configuración de servidor NTP en nuestras placas.

- Generación de web server dinámico con posibilidad de configuración remota así como la activación o desactivación del mismo. 

- Configuración de cliente y servidor HTTP.

- Configuraciñon especifica y preprogramación de operaciones evento-acción.

- Configuración MQTT usando la App como herramienta de configuración o estableciendo nuestro microcontrolador como un servidor o cliente Mosquitto en sólo unos pasos.

Pero esto es sólo la entrada a una posiblidad de configuración individual de cada uno de nuestros elementos dentro de un todo que podrá conformar una red domótica administrable igualmente a través de Covalent.

