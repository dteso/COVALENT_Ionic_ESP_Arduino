
                                                                                  IONIC 5

                                                                                  ionic -v

                                                                6.1.0
                                                                ───────────────────────────────────────────────

                                                                    Ionic CLI update available: 6.1.0 → 6.2.0
                                                                        Run npm i -g @ionic/cli to update

                                                                ───────────────────────────────────────────────

                                                                >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

                                                                                  JAVA 8

                                                                                java -version

                                                            java version "1.8.0_211"
                                                            Java(TM) SE Runtime Environment (build 1.8.0_211-b12)
                                                            Java HotSpot(TM) 64-Bit Server VM (build 25.211-b12, mixed

                                                            Debe asegurarse que en el path figure la ruta del JDK 

                                                                >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

                                                                                    GRADLE

                                                                                   gradle -v

                                                            ------------------------------------------------------------
                                                            Gradle 5.6.4
                                                            ------------------------------------------------------------

                                                            Build time:   2019-11-01 20:42:00 UTC
                                                            Revision:     dd870424f9bd8e195d614dc14bb140f43c22da98

                                                            Kotlin:       1.3.41
                                                            Groovy:       2.5.4
                                                            Ant:          Apache Ant(TM) version 1.9.14 compiled on March 12 2019
                                                            JVM:          1.8.0_211 (Oracle Corporation 25.211-b12)
                                                            OS:           Windows 10 10.0 amd64

                                                            Debe asegurarse que la ruta del Gradle instalado figure en el path

*********************************************************************************************************************************************************************                                                                                   
                                                                                   +++ @CORDOVA +++

                                                                                    npm i -g cordova


+ Bluetooth Cordova Plugin

                                                                ionic cordova plugin add cordova-plugin-bluetooth-serial
                                                                npm install @ionic-native/bluetooth-serial


+ Keyboard Cordova Plugin

                                                                ionic cordova plugin add cordova-plugin-ionic-keyboard
                                                                npm install @ionic-native/keyboard


> Build & Run 
                                                                            ionic cordova build android 

                                                            --> Crea la carpeta de proyecto android y un proyecto cordova

                                                                            ionic cordova run android -l 

                                                --> Ejecuta la aplicación y abre servidor. al poner -l estamos habilitando el live reloading para la compilación



npm install @ionic/storage

gradle wrapper --gradle-version 5.0

En el gradle-wraper.properties.ts
distributionUrl=https\://services.gradle.org/distributions/gradle-5.6.4-all.zip
gradle-5.6.4-all.zip