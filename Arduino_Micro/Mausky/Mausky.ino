
#include <Keyboard.h>
#include <Mouse.h>
#include <MouseTo.h>
#include <Math.h>
#define DEBUG(a) Serial.println(a);
// Basic Bluetooth sketch HC-06_01
// Connect the Hc-06 module and communicate using the serial monitor
//
// The HC-06 defaults to AT mode when first powered on.
// The default baud rate is 9600
// The Hc-06 requires all AT commands to be in uppercase. NL+CR should not be added to the command string
//
 
 
#include <SoftwareSerial.h>
SoftwareSerial BTserial(8,9); // RX | TX
// Connect the HC-06 TX to the Arduino RX on pin 8. 
// Connect the HC-06 RX to the Arduino TX on pin 9 through a voltage divider.



/***************************************/
/*
 *  SET DEVELOP OR TESTING MODE
 *  0: DEVELOP
 *  1: TESTING
 */

//int mode = 0; //Develop
int mode = 1; //Testing

long x;
long y;

String xReading;
String yReading;
String stXreading;
String stYreading;
String reading;

int kx;
int ky;

int userResolutionX;
int userResolutionY;

int resolutionX;
int resolutionY;

int responseDelay = 1;        // response delay of the mouse, in ms

int lastX = 530;
int lastY = 400;

int startX =0;
int startY =0;

int screenX = 530;
int screenY = 400;
 
void setup() 
{
    Mouse.begin();
    Keyboard.begin();
    MouseTo.setCorrectionFactor(1);
//    userResolutionX = 1366;
//    userResolutionY = 768;
//    MouseTo.setScreenResolution(userResolutionX,userResolutionY);
    
    x=lastX;
    y=lastY;
 
    // HC-06 default serial speed is 9600
    BTserial.begin(9600);  

    Serial.begin(9600); // !!! Comment for not testing mode
    resolutionX=MouseTo.getScreenResolutionX();
    resolutionY=MouseTo.getScreenResolutionY();
    MouseTo.setMaxJump(100);
    kx = 7;
    ky = 4.2;
}
 
void loop()
{
 
// Keep reading from HC-06 and send to Arduino Serial Monitor
  while (BTserial.available()) //Check if there is an available byte to read
  {
  int c = BTserial.read(); //Conduct a serial read
    if (c == '#') {
      while (MouseTo.move() == false) {}
      manageReading();
      reading="";
      break;
    }else{
        reading += (char)c; //Shorthand for reading = reading + c
      }
    }
}


/**
 * manageReading() - This method takes decissions and make transformation 
 * depending input bluetooth received data
 */
void manageReading(){
 
  int comaIndex = reading.indexOf(',');
  int touchStart = reading.indexOf("TCHSTRT");
  int evtClick = reading.indexOf("click");
  xReading=reading.substring(1,comaIndex);
  yReading=reading.substring(comaIndex+1, reading.length());
  Serial.println(reading);



//Coordenadas x,y recibidas por el BTSerial
  x=xReading.toInt();
  y=yReading.toInt();


//Es un click
  if (evtClick>-1){
    Mouse.click();
    MouseTo.setTarget(screenX, screenY, 0);
    while (MouseTo.move() == false) {}
  }
  
//Es un carácter
  if(reading.length()==1){
    Keyboard.press(reading[0]);
    Serial.println(reading[0]);
    Keyboard.release(reading[0]);
    delay(50);
  }
  
//Es un evento de inicio de movimiento de puntero  
  if(touchStart == 1){
//  stXreading=reading.substring(8,comaIndex);
//  stYreading=reading.substring(comaIndex+1, reading.length());
//  startX = stXreading.toInt();
//  startY = stYreading.toInt();
   lastX=screenX;
   lastY=screenY;
  MouseTo.setTarget(screenX, screenY, 0);
  while (MouseTo.move() == false) {}
  }

  
//Movimiento de ratón
if (comaIndex > -1){
    if(x>MouseTo.getTargetX()){ // Moved RIGHT
        screenX = screenX + (x-MouseTo.getTargetX());
        //Serial.println("RIGHT");
       }
      
      if (x<MouseTo.getTargetX()){ // Moved  LEFT
        screenX = screenX - (MouseTo.getTargetX()-x);  // Moving to right difference of x positions
        //Serial.println("LEFT");
      }
      
      if(y>MouseTo.getTargetY()){ // Moved  DOWN
        screenY = screenY + (y-MouseTo.getTargetY()); // Moving to UP difference of Y positions
        //Serial.println("DOWN");
      }
      
      if(y<MouseTo.getTargetY()){ //x>lastX ---> Moved UP
        screenY = screenY - (MouseTo.getTargetY()-y);  // Moving to DOWN difference of Y positions
        //Serial.println("UP");
      }
           screenX=round(screenX*kx);
           screenY=round(screenY*ky);
           MouseTo.setTarget(screenX, screenY, 0);
           lastX=screenX;
           lastY=screenY;
    //       Serial.println("LAST TARGET: ");
    //       Serial.print(MouseTo.getTargetX());
    //       Serial.print("-");
    //       Serial.println(MouseTo.getTargetY());      
    //       Serial.println("-------------------------------");
       delay(responseDelay);
  
  }
  
}
