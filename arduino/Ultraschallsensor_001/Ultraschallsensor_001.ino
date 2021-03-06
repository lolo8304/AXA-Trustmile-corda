//Ultraschallsensor
//V001 - 2019-09-11 - First Version
//V002 -            - Communication with ESP32 over A2(Red) und A3(Black) - High = Car on measurement
//V003 -            - Average measurements
//V004 -            - without Average (disturbed stopped state under sensor

#define RedTrigger   2
#define RedEcho      3
#define BlackTrigger 4
#define BlackEcho    5

#define EV_Buff     500

unsigned long curr_ms;

unsigned long Red_mm   = 0;
unsigned long Black_mm = 0;
unsigned long EV_Red;
unsigned long EV_Black;

unsigned long Red_LED;
boolean       Red_LED_SW   = false;
boolean       Red_State_SW = false;
unsigned long Red_State;

unsigned long Black_LED;
boolean       Black_LED_SW = false;
boolean       Black_State_SW = false;
unsigned long Black_State;

unsigned long Red_LOW;
unsigned long Black_LOW;

void setup()
{
Serial.begin (9600); //Serielle kommunikation starten, damit man sich später die Werte am serial monitor ansehen kann.
Serial.println("Start");
pinMode(RedTrigger, OUTPUT);
pinMode(RedEcho, INPUT);
pinMode(BlackTrigger, OUTPUT);
pinMode(BlackEcho, INPUT);
pinMode(A0,OUTPUT); //LED
pinMode(A1,OUTPUT); //LED
pinMode(A2,OUTPUT); //ESP32 Red
pinMode(A3,OUTPUT); //ESP32 Black
digitalWrite(RedTrigger,LOW);
digitalWrite(BlackTrigger,LOW);
digitalWrite(A0,LOW);
digitalWrite(A1,LOW);
digitalWrite(A2,LOW);
digitalWrite(A3,LOW);

curr_ms     = millis();
EV_Black    =
Red_LED     =
Black_LED   =
Red_State   =
Black_State =
EV_Red      = curr_ms;

Measure_Red();
Measure_Black();
Red_LOW   = Red_mm;
Black_LOW = Black_mm;
Serial.print("Red LOW>");Serial.println(Red_LOW);
Serial.print("Black LOW>");Serial.println(Black_LOW);
Red_LOW   -= 5;
Black_LOW -= 5;

}


void loop()
{
curr_ms = millis();

Measure_Red();
Measure_Black();

if(Red_mm < Red_LOW)
  {//Active
    
    if(Red_State_SW)
      {//already active
        Red_State = curr_ms; //Refresh debounce
//        Serial.println("Red Car Refresh debounce");
      } else
      {//newly active
        Serial.print("Red Car > ");
        Serial.println(Red_mm);
        Red_State_SW = true;
        Red_LED_SW = true;
        EV_Red     =
        Red_LED    = 
        Red_State  = curr_ms;
      };//newly active
    
  } else //Active
  {//inactive

    //Check Debounce
    if(curr_ms > (Red_State + EV_Buff))
      {//check active
//        Serial.println("Red Debounce deactivated");
        Red_State_SW = false;
                
      };//check active
    
  };//inactive

if(Black_mm < Black_LOW)
  {//Active
    
    if(Black_State_SW)
      {//already active
        Black_State = curr_ms; //Refresh debounce
//        Serial.println("Black Car Refresh debounce");
      } else
      {//newly active
        Serial.print("Black Car > ");
        Serial.println(Black_mm);
        Black_State_SW = true;
        Black_LED_SW = true;
        EV_Black     =
        Black_LED    = 
        Black_State  = curr_ms;
      };//newly active
    
  } else //Active
  {//inactive

    //Check Debounce
    if(curr_ms > (Black_State + EV_Buff))
      {//check active
//        Serial.println("Black Debounce deactivated");
        Black_State_SW = false;
                
      };//check active
    
  };//inactive


if(Red_LED_SW)
  {
   digitalWrite(A0,HIGH);digitalWrite(A2,HIGH);
   if(curr_ms > (Red_LED + 200))
     {Red_LED_SW = LOW;digitalWrite(A0,LOW);digitalWrite(A2,LOW);}; 
  }

if(Black_LED_SW)
  {
   digitalWrite(A1,HIGH);digitalWrite(A3,HIGH);
   if(curr_ms > (Black_LED + 200))
     {Black_LED_SW = LOW;digitalWrite(A1,LOW);digitalWrite(A3,LOW);}; 
  }

};


void Measure_Red()
{  
digitalWrite(RedTrigger, HIGH);
delayMicroseconds(5);
digitalWrite(RedTrigger, LOW);

Red_mm = pulseIn(RedEcho,HIGH) * 34 / 200;  
delay(5); //Ultrasonic switch off delay
};

void Measure_Black()
{
digitalWrite(BlackTrigger, HIGH);
delayMicroseconds(5);
digitalWrite(BlackTrigger, LOW);

Black_mm = pulseIn(BlackEcho,HIGH) * 34 / 200;
delay(5); //Ultrasonic switch off delay
};
