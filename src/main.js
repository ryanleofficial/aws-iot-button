
var awsIot      = require('aws-iot-device-sdk'); // using aws Library
var wpi         = require('wiring-pi') // using wiring-pi library

var Pin = 0;    // pin 17 on raspberry-pi
var Button = 1; // pin 18 on raspberry-pi
var HIGH = 1;   // wiring-pi use 1 and 0 but for easy to read I 
var LOW = 0;    // change it to LOW and HIGH
var count = 0;  // variable count and LED to control the button (pressed 1: ON, double pressed: OFF) 
var LED = 0;

//** Setting up the input and output using wiring-pi Library**//
wpi.setup('wpi');
wpi.pinMode(Pin, wpi.OUTPUT);
wpi.pinMode(Button, wpi.INPUT);

//** Key and certificates with AWS's Cloud **//
var device = awsIot.device({
   keyPath: '/home/pi/Downloads/raspberry.private.key',
  certPath: '/home/pi/Downloads/raspberry.cert.pem',
    caPath: '/home/pi/Downloads/root-CA.crt',
  clientId: 'raspberry',
    region: 'us-west-2'
});

//** Publish to topic 'light' if button is press **//
device
        .on('connect', function(){
            console.log('Connected!');
            device.subscribe('light');
                setInterval(function()
                {

                if (wpi.digitalRead(Button) == HIGH) {
                    LED = 1;
                    count++;
                }
                    if (LED == 1 && count == 1) {
                        device.publish('light', JSON.stringify({message: "hello", state:{light:"on"}}))
                        LED = 0;
                    }
                        if (count == 3) {
                                device.publish('light', JSON.stringify({message: "hello", state:{light:"off"}}))
                                count = 0;
                        }
                },250)
        });

//** Decode the message to control the LED **//
device
        .on('message', function(topic, payload){
                console.log('message', topic, payload.toString());
                var stateObject = JSON.parse(payload);
                if (stateObject.state.light === 'on') {
                        wpi.digitalWrite(Pin, 1);
                } else if (stateObject.state.light === 'off') {
                        wpi.digitalWrite(Pin,0);
                }
        });



