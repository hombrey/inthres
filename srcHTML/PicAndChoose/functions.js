//{{{variable declarations
"use strict";
let bgX;
let scaleX, scaleY;
let promptSet;
let choices;
let imgIndex=-1;
let assetDir, sourceDir;
let mainImg;
let pickSound;
let tingSound;
let errSound;
let cardSound;
let activeNum=1;
let isPicFullScreen=false;
let angleImg=0;
let isPenToolHidden=true;
let helpHandle;
let isMute=true;
//}}}variable declarations

//{{{class declarations
class PromptString  {
    constructor(text,ans){
        this.txt = text;
        this.ans = ans;
    } //constructor
} //class SmartString
//}}}class declarations

//{{{event listeners
window.onload = initWin();
window.addEventListener("resize", initWin);
window.addEventListener("keydown", evalKeyDown, false); //capture keypress on bubbling (false) phase
window.addEventListener("keyup", evalKeyUp, false); //capture keypress on bubbling (false) phase

function evalKeyUp(evnt) {
    let keyReleased = evnt.keyCode;
    switch (keyReleased) {
        case 8 : evnt.preventDefault();
                 if(!event.shiftKey) {
                     parent.postMessage("draw","*"); 
                     pentool("hide");
                 } else { parent.postMessage("noDraw","*"); 
                     pentool("hide");
                 } //if shiftkeya; 
                 break; //key: <backspace>

        case 112  : evnt.preventDefault(); helpHandle.className="hiddenHelp"; break; //key: F1

        default : return;
    } //switch (keyPressed)
}//evalKeyUp

function evalKeyDown(evnt) {
    let keyPressed = evnt.keyCode;
    //console.log ("keyDn: ",keyPressed);
    switch (keyPressed) {
       case 87  : if(!event.shiftKey) parent.postMessage("FocusSeq","*");
                  else parent.postMessage("FocusTool","*"); 
                  break; //key: w
        case 49 : evalChosen(1); break; //key: 1
        case 50 : evalChosen(2); break; //key: 2
        case 51 : evalChosen(3); break; //key: 3
        case 52 : evalChosen(4); break; //key: 4
        case 39 : rotatePiece(90);break; //key: right
        case 37 : rotatePiece(-90);break; //key: left
       case 83  : stepToLast(); break; //key: s
        case 38 : viewNextImg(-1); 
                  break; //key: <up>
        case 40 : viewNextImg(1); 
                  break; //key: <down>
        case 70 :  if(event.ctrlKey) togglePicFullScreen(evnt); //if (event.ctrlKey)
                   break; // 'f'
        case 112  : evnt.preventDefault(); helpHandle.className="unhiddenHelp"; break; //key: F1

        case 8 : evnt.preventDefault(); 
                    parent.postMessage("noDraw","*"); 
                    pentool("show");
                break; //key: <backspace>
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


    //Get project source
    sourceDir = document.getElementById("srcDir").innerHTML;
    //Get project source
    assetDir = document.getElementById("assetDir").innerHTML;

    //Get centered image 
    mainImg = document.getElementById("mainImg");

    scaleX = bgX.clientWidth/bgX.naturalWidth;
    scaleY = bgX.clientHeight/bgX.naturalHeight;

    await delay (10); 

    choices = [
            document.getElementById('choice1'),
            document.getElementById('choice2'),
            document.getElementById('choice3'),
            document.getElementById('choice4')
    ]; //choices

    choices[1-1].resetY = "1vh";
    choices[1-1].resetX = "1vw";
    choices[2-1].resetY = "1vh";
    choices[2-1].resetX = "84vw";

    choices[3-1].resetY = "84vh";
    choices[3-1].resetX = "1vw";
    choices[4-1].resetY = "84vh";
    choices[4-1].resetX = "84vw";


    pickSound = new sound(sourceDir+"wav/pick.mp3");
    tingSound = new sound(sourceDir+"wav/ting.mp3");
    errSound = new sound(sourceDir+"wav/err.mp3");
    cardSound = new sound(sourceDir+"wav/card.mp3");

    createHelpWindow();
    createPentool();

    //document.getElementById("dummy").focus(); //dummy select element that grabs the focus of the iframe
//};//document.getElementById ... wait for element before loading
} //function initWin()

//}}}initializations

//{{{handler functions
function viewNextImg(inc) {
    imgIndex=imgIndex+inc;
   
    resetPosition(); 
    if (imgIndex<0) imgIndex = promptSet.length-2;
    else if (promptSet[imgIndex].txt=="") imgIndex = 0;

    let imgSrc =(assetDir+promptSet[imgIndex].txt);

    angleImg = 0;
    mainImg.style.transform="rotate( 0deg)";
    pickSound.start();
    mainImg.src = imgSrc;
    //
    //display image name and index
    let StatusText=(imgIndex+1)+"/"+(promptSet.length-1);
    StatusText+=": "+promptSet[imgIndex].txt;
    document.getElementById('dummy').options[0].innerHTML=StatusText;

} //function vewNextImg(inc)

async function stepToLast() {

    imgIndex++;
    if (promptSet[imgIndex].txt=="") imgIndex--;
    viewNextImg(0); 

} //async function stepToLast()

function rotatePiece(rotation) {
    cardSound.start();
    angleImg+=rotation;
    mainImg.style.transform = "rotate("+angleImg+"deg)";
} //function rotatePiece()
function togglePicFullScreen(evnt) {
    evnt.preventDefault();
    if (!isPicFullScreen){
        console.log("to full screen");
        if (mainImg.requestFullscreen) { mainImg.requestFullscreen(); }
        else if (mainImg.webkitRequestFullScreen) { mainImg.webkitRequestFullScreen(); }
        isPicFullScreen = true;
    }//if (!isFullScreen)
    else {
        console.log("exit full screen");
        //if (mainImg.exitFullscreen) { mainImg.exitFullscreen(); } 
        //else if (mainImg.webkitExitFullscreen) { mainImg.webkitExitFullscreen(); }
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } //if document.cancelFullScreen
        isPicFullScreen = false;
    } //else of isfullScreen
                   
} //function toggleFullScreen()
function evalClick(clicked_id) {
    let extractIdNum = (clicked_id.replace("choice",""));
    let clickedNum = parseInt(extractIdNum);
    //console.log ("clicked:"+clickedNum); 
    evalChosen(clickedNum);
} //function evalClick(clicked_id)

function evalChosen(numChosen) {
    resetPosition(); //reset previous active number before switching
    activeNum = numChosen;
    choices[numChosen-1].style.top= '43vh';
    choices[numChosen-1].style.left= '43vw';

    if (numChosen == promptSet[imgIndex].ans) {
        tingSound.start();
    }// if (numChosen == promptSet)
    else {
        errSound.start();
        setTimeout (function () {
            resetPosition(); 
        }, 400); //setTimeOut
    } // else [of if numChosen == promptSet]

} //function evalChosen(numChosen)

//}}}handler functions

//{{{draw functions
function createPentool() {

    const divtoolC = document.createElement('div');
    divtoolC.setAttribute('id','pentool');
    divtoolC.setAttribute('class','hiddenTool');
    document.body.appendChild(divtoolC);

    const undoButtonC = document.createElement('button');
    undoButtonC.setAttribute('id','undoButton'); undoButtonC.setAttribute('class','stroke-color');
    undoButtonC.setAttribute('onclick','drawRestore()');
    undoButtonC.innerHTML="Z";
    divtoolC.appendChild(undoButtonC);

    const clearButtonC = document.createElement('button');
    clearButtonC.setAttribute('id','clearButton'); clearButtonC.setAttribute('class','stroke-color');
    clearButtonC.setAttribute('onclick','drawClear()');
    clearButtonC.innerHTML="C";
    divtoolC.appendChild(clearButtonC);

    const c1ButtonC = document.createElement('button');
    c1ButtonC.setAttribute('id','color1'); c1ButtonC.setAttribute('class','stroke-color');
    c1ButtonC.setAttribute('style','background:black'); c1ButtonC.setAttribute('onclick','drawColor(1)');
    divtoolC.appendChild(c1ButtonC);

    const c2ButtonC = document.createElement('button');
    c2ButtonC.setAttribute('id','color2'); c2ButtonC.setAttribute('class','stroke-color');
    c2ButtonC.setAttribute('style','background:red'); c2ButtonC.setAttribute('onclick','drawColor(2)');
    divtoolC.appendChild(c2ButtonC);

    const c3ButtonC = document.createElement('button');
    c3ButtonC.setAttribute('id','color3'); c3ButtonC.setAttribute('class','stroke-color');
    c3ButtonC.setAttribute('style','background:yellow'); c3ButtonC.setAttribute('onclick','drawColor(3)');
    divtoolC.appendChild(c3ButtonC);

    const c4ButtonC = document.createElement('button');
    c4ButtonC.setAttribute('id','color4'); c4ButtonC.setAttribute('class','stroke-color');
    c4ButtonC.setAttribute('style','background:green'); c4ButtonC.setAttribute('onclick','drawColor(4)');
    divtoolC.appendChild(c4ButtonC);

    const c5ButtonC = document.createElement('button');
    c5ButtonC.setAttribute('id','color5'); c5ButtonC.setAttribute('class','stroke-color');
    c5ButtonC.setAttribute('style','background:blue'); c5ButtonC.setAttribute('onclick','drawColor(5)');
    divtoolC.appendChild(c5ButtonC);

    const c6ButtonC = document.createElement('button');
    c6ButtonC.setAttribute('id','color6'); c6ButtonC.setAttribute('class','stroke-color');
    c6ButtonC.setAttribute('style','background:white'); c6ButtonC.setAttribute('onclick','drawColor(6)');
    divtoolC.appendChild(c6ButtonC);

} //function createPentool()

function pentool(action) {
    if (action=="show") {
        //deblog ("show pane");
        document.getElementById("pentool").className = "unhiddenTool";
        isPenToolHidden=false;
    } //if (action=="show")
    if (action=="hide") {
        //deblog ("show pane");
        document.getElementById("pentool").className = "hiddenTool";
        isPenToolHidden=true;
    } //if (action=="show")
} //function toggleShowPentool

function drawRestore() { parent.postMessage("undoDraw","*"); } //drawRestore()
function drawClear() { parent.postMessage("clearDraw","*"); } //drawClear()
function drawColor(colorInt) { 
        var intMsg="color"+colorInt;
        //deblog (intMsg);
        parent.postMessage(intMsg,"*"); 
} //drawColor()

//}}} draw functions

//{{{helper functions
function createHelpWindow() {
    helpHandle = document.createElement('iframe');
    helpHandle.setAttribute('id','myHelpFrame');
    helpHandle.setAttribute('class','hiddenHelp');
    helpHandle.setAttribute('src',sourceDir+'help.html');
    document.body.appendChild(helpHandle);
} //function createHelpWindow()

function resetPosition() {
            choices[activeNum-1].style.top= choices[activeNum-1].resetY;
            choices[activeNum-1].style.left= choices[activeNum-1].resetX; 
} //function resetPosition()
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
