//{{{variable declarations
"use strict";
let bgX;
let scaleX, scaleY;
let pickSound;
let tingSound;
let errSound;
let cardSound;
let tokenInx=0;
let tokens;
let steps;
let lastStep;
let stepL, stepW;
let scalL, scalW;

//}}}variable declarations

//{{{event listeners
window.onload = initWin();
window.addEventListener("resize", initWin);
window.addEventListener("keydown", evalKeyDown, false); //capture keypress on bubbling (false) phase
function evalKeyDown(evnt) {
    let keyPressed = evnt.keyCode;
    //console.log ("keyDn: ",keyPressed);
    switch (keyPressed) {
       case 87  : if(!event.shiftKey) parent.postMessage("FocusSeq","*");
                  else parent.postMessage("FocusTool","*"); 
                  break; //key: w
        case 49 : selectToken("pick",1); break; //key: 1
        case 50 : selectToken("pick",2); break; //key: 2
        case 51 : selectToken("pick",3); break; //key: 3
        case 52 : selectToken("pick",4); break; //key: 4
        case 53 : selectToken("pick",5); break; //key: 5
        case 39 : stepToken(tokenInx,1); break; //key: right
        case 37 : stepToken(tokenInx,-1); reak; //key: left
        case 40 : selectToken("next",1); break; //key: <down>
        case 38 : selectToken("next",-1); break; //key: <up>
        case 190 : break; //key: <period> to show/hide pattern
        case 188 : cycleSee(tokenInx); break; //key: <comma> to show alt image
        default : return;
    } //switch (keyPressed)
} //evalKey(event)

window.addEventListener('message', evalMessage);
function evalMessage (evnt) {
    // Get the sent data
    var data = evnt.data;
    //console.log ("message received");

    if (data == "FocusIframe") {
        //console.log("focusDummy");
        document.getElementById('dummy').focus();
    }
} //function evalMessage(event)

//}}}event listeners

//{{{initializations

//make sure elements are loaded before proceeding
const checkElement = async selector => {
  while ( document.querySelector(selector) === null) {
    await new Promise( resolve =>  requestAnimationFrame(resolve) )
  } //while ( document.querySelector(selector) === null)
  return document.querySelector(selector); 
}; //const checkElement = async selector

//make sure elements are loaded before proceeding
async function initWin() {
//document.getElementById('backgroundX').onload = async function () { //wait for element before loading
    await delay (80); 
    //check to see if element is loaded
    checkElement('backgroundX').then((selector) => { console.log(selector); });
    //Get a reference to the canvas
    bgX = document.getElementById('backgroundX');

    scaleX = bgX.clientWidth/bgX.naturalWidth;
    scaleY = bgX.clientHeight/bgX.naturalHeight;

    await delay (30);

    //defined in HTML
    //populate tokens and steps arrays and define unscaled step offsets
    stepsAndTokens();

} //function initWin()

//}}}initializations

//{{{handler functions

selectToken(action,tokenInt) {

} //selectToken(action,tokenInt)

stepToken(tokenInt, moveBy) {

} //stepToken(tokenInt, moveBy)

cycleSee(tokenInt) {

} //cycleSee(tokenInt)

//}}}handler functions

//{{{helper functions

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.start = function(){
        this.sound.pause();
        this.sound.currentTime = 0;
        this.sound.play();
    } //this.start = function(){
    this.play = function(){
        this.sound.play();
    } //this.play = function(){
    this.stop = function(){
        this.sound.pause();
        this.sound.currentTime = 0;
    }//this.stop = function(){    
}//function sound(src)

function insertCss( code ) {
    var style = document.createElement('style');
    style.innerHTML = code;

    document.getElementsByTagName("head")[0].appendChild( style );
} //function insertCss( code)

function delay(n) {  
        n = n || 2000;
        return new Promise(done => {
                setTimeout(() => {
                        done();
                        }, n);
            });
}//function delay()

//}}}helper functions
