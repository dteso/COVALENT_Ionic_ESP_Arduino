#include <Arduino.h>
#include <covalent.h>
#include "myoled.cpp"

Covalent covalent;
boolean blink = false;
int lastSec = 0;

void setup()
{
  covalent.setup();
  loadingScreen();
  display.clearDisplay();                                        //for Clearing the display
  display.drawBitmap(0, 0, medusaka_logoBitmap, 128, 64, WHITE); // display.drawBitmap(x position, y position, bitmap data, bitmap width, bitmap height, color)
  display.display();
}


void loop()
{
  covalent.loop();
  if(lastSec != covalent.realSec){
    lastSec = covalent.realSec;
    blink = true;
  }else{
    blink = false;
  }

  if ((blink) && (covalent.realSec == 2 || covalent.realSec == 3 || covalent.realSec == 4 || covalent.realSec == 10 || covalent.realSec == 11 || covalent.realSec == 13 || covalent.realSec == 16 || covalent.realSec == 20 || covalent.realSec == 21 || covalent.realSec == 25 || covalent.realSec == 26 || covalent.realSec == 30 || covalent.realSec == 34 || covalent.realSec == 37 || covalent.realSec == 49 || covalent.realSec == 51 || covalent.realSec == 57 || covalent.realSec == 58 || covalent.realSec == 59))
  {
    blink=false;
    display.clearDisplay();                                         //for Clearing the display
    display.drawBitmap(0, 0, medusaka_logoBitmap2, 128, 64, WHITE); // display.drawBitmap(x position, y position, bitmap data, bitmap width, bitmap height, color)
    display.display();
    delay(70);
    display.clearDisplay();                                        //for Clearing the display
    display.drawBitmap(0, 0, medusaka_logoBitmap, 128, 64, WHITE); // display.drawBitmap(x position, y position, bitmap data, bitmap width, bitmap height, color)
    display.display();
  }
}
