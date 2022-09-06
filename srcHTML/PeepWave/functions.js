//{{{variable declarations
"use strict";
let scaleX, scaleY;
let bgX;
let currentScene=0;
let holeInit = false;
let pauseIndicator;
let canvas, ctx2D;
let prevX = 0, currX = 0, prevY = 0, currY = 0;
let hole = 75;
let holeBorder = 800;
let selColor = "black";
let pickSound, jingSound, tingSound;
let wavDoc;
let isWavDocSet=false;
let imgFill;
let pattern;
let assetDir,srcDir;
let imgIndex=0;
let picSet;
let wavSet;
let isCanvasVisible=false;
let isPaused=true;
let playRate = 1;
let isPenToolHidden=true;
let helpHandle;
let isMute=true;
//}}}variable declarations

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
    //console.log ("keyUp: ",keyPressed);
    let rateIncValue = 0.2;
    switch (keyPressed) {
       case 87  : if(!event.shiftKey) parent.postMessage("FocusSeq","*");
                  else parent.postMessage("FocusTool","*"); 
                  break; //key: w
       case 49  : nextScene(1); break; //key: 1
       case 50  : nextScene(2); break; //key: 2
       case 51  : nextScene(3); break; //key: 3
       case 52  : nextScene(4); break; //key: 4
       case 53  : nextScene(5); break; //key: 5
       case 54  : nextScene(6); break; //key: 6
       case 55  : nextScene(7); break; //key: 7
       case 56  : nextScene(8); break; //key: 8
       case 38  : nextScene(imgIndex-1); break; //key: <up>
       case 40  : nextScene(imgIndex+1); break; //key: <down>
       case 83  : stepToLast(); break; //key: s
       case 190 : toggleCanvas(); break; //key: <period> to show/hide pattern
       case 188 : showAlt(); break; //key: <comma> to show alt image
       case 39  : if(!event.shiftKey) changeHole(1.5);
                  else changeHole (5.0625);
                  break; //key: right
       case 37  : changeHole(0.666); break; //key: left
       case 32  : evnt.preventDefault(); togglePlay() ;break; //key: <spacebar>
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

async function initWin() {

    await delay (60);
    //check to see if element is loaded
    checkElement('backgroundX').then((selector) => { console.log(selector); });

    //check to see if element is loaded
    checkElement('can0').then((selector) => { console.log(selector); });
    srcDir = document.getElementById("srcdir").innerHTML; 
    //Get location of lesson assets
    assetDir = document.getElementById("assetdir").innerHTML;
    
    //Get a reference to the canvas
    bgX = document.getElementById('backgroundX');

        // stay on current scene if src image (likely from 'alt') is not found
        bgX.onerror = function ()  {
            isMute=true;
            nextScene(imgIndex);
            isMute=false;
        } //bgX.onerror = function () 

    scaleX = bgX.clientWidth/bgX.naturalWidth;
    scaleY = bgX.clientHeight/bgX.naturalHeight;


    canvas = document.getElementById('canvas');
    ctx2D = canvas.getContext("2d");
    canvas.width = Math.round (canvas.width*scaleX);
    canvas.height = Math.round (canvas.height*scaleY);

    ctx2D.fillStyle = selColor;

    imgFill = new Image();
    imgFill.src = srcDir+"img/patt0.jpg";
    imgFill.onload = function () {
        pattern = ctx2D.createPattern(imgFill, 'repeat');
        ctx2D.fillStyle = pattern;
    } //imgFill.onload = function ()
    setTimeout (function() { //set delay before calculating drawable parameters
        ctx2D.fillRect (0,0, canvas.width, canvas.height);
    }, 10);//setTimeOut (function()


    tingSound = new sound(srcDir+"wav/ting.mp3");
    jingSound = new sound(srcDir+"wav/jing.mp3");
    pickSound = new sound(srcDir+"wav/pick.mp3");
    wavDoc = new sound(srcDir+"wav/pick.mp3");
    wavDoc.sound.onerror = function () {
        wavDoc.sound.src = srcDir+"wav/pick.mp3";
        pauseIndicator.style.display = "none";
        isPaused = true;
    } //wavDoc.onerror = function ()

    initArrays(); 
    picSet[0].wav = 0;

    createHelpWindow();
    createPentool();

    pauseIndicator = document.getElementById('pauseIndicator');
    //document.getElementById("dummy").focus(); //dummy select element that grabs the focus of the iframe

    //select first image without triggering the play() function
    isMute=true;
    nextScene(1);
    isMute=false;
} //function initWin()

//}}}window init

//{{{handler functions

function changeHole(mult) {
    hole = Math.round (hole*mult);
    holeBorder = Math.round (holeBorder*mult);
    ctx2D.fillRect (0,0, canvas.width, canvas.height);
    drawHole();
    pickSound.start();
} //function changeHole()

function drawHole() {
    ctx2D.fillRect (currX-holeBorder/2, currY-holeBorder/2, holeBorder, holeBorder);
    ctx2D.clearRect(currX-hole/2, currY-hole/2, hole, hole);
} //function drawHole()

function moveHole(res,evnt) {
    prevX = currX;
    prevY = currY;
    currX = evnt.clientX - canvas.offsetLeft;
    currY = evnt.clientY - canvas.offsetTop;
    drawHole();
    if (res == 'up' || res == "out") {
        ctx2D.fillRect (0,0, canvas.width, canvas.height);
    } //if (res =='up' .. 'out')
} //function moveHole(res,evnt)

function toggleCanvas() {
   if (isCanvasVisible){
        canvas.style.display = "none";
        canvas.removeEventListener("mousemove", function (e) { moveHole('move', e) }, false);
        canvas.removeEventListener("mouseout", function (e) { moveHole('out', e) }, false);
        isCanvasVisible = false;
   }else{
        canvas.style.display = "block";
        canvas.addEventListener("mousemove", function (e) { moveHole('move', e) }, false);
        canvas.addEventListener("mouseout", function (e) { moveHole('out', e) }, false);
        isCanvasVisible = true;
   } //if (isCanvasVisible)
   pickSound.start();
} //function toggleCanvass

function showAlt() {
    let imgSrc =(assetDir+"alt/"+picSet[imgIndex].src);
    bgX.src = imgSrc;


        tingSound.start();

} //function showAlt()

function nextScene(chosenIndx) {
    //stop associated audio whenever the picture changes. Do this only if ./wav directory is populated
    if (wavSet.length>2) wavSet[picSet[imgIndex].wav].stop(); 

    hole = 75;
    ctx2D.fillRect (0,0, canvas.width, canvas.height);
    drawHole();
    imgIndex=chosenIndx;
    //console.log("index: "+imgIndex);
    if (imgIndex<1) imgIndex = picSet.length-2;
    else if (imgIndex>picSet.length-2) imgIndex = 1;
    //console.log("image: "+picSet[imgIndex].src);
    let imgSrc =(assetDir+picSet[imgIndex].src);

    bgX.src = imgSrc;
    if (!isMute) {
        if (isCanvasVisible) jingSound.start(); else pickSound.start();
    } //if (!muteScene)

    isWavDocSet=false;

    //display image name and index
    let StatusText=imgIndex+"/"+(picSet.length-2);
    if (imgIndex == 1) StatusText+=": PeepWave";
        else StatusText+=": "+picSet[imgIndex].src;

    document.getElementById('dummy').options[0].innerHTML=StatusText;
} //function changeScene(sceneNum)

async function stepToLast() {
    let nextImg=imgIndex+1;
    if (nextImg>picSet.length-2) nextImg=picSet.length-2;
    nextScene(nextImg); 

} //async function stepToLast()

function togglePlay() {

    if (!isWavDocSet) {
        //use auto-generated wavSet array if there is a 1:1 match between images and mp3
        if (wavSet.length == picSet.length)
            //wavDoc=wavSet[picSet[imgIndex].wav];
            wavDoc=wavSet[imgIndex];
        else {
        //try to load audio file with the same name as the image 
            let imgBaseName = picSet[imgIndex].src.split('.').slice(0, -1).join();  // extract base name of the current image
            wavDoc.sound.src="./wav/"+imgBaseName+".mp3";
        } // else of wavSet.length check

        isWavDocSet = true;
    } //if isWavDocSet

    if (!isPaused) {
        pauseIndicator.style.display = "block";
        pauseIndicator.style.backgroundColor = "red";
        wavDoc.pause(); 
        isPaused = true; 
        //console.log("pause");
    } else {
        pauseIndicator.style.display = "block";
        pauseIndicator.style.backgroundColor = "green";
        wavDoc.play(); 
        isPaused = false;
    } // if (isPaused)

} //function togglePlay()
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
    helpHandle.setAttribute('src',srcDir+'help.html');
    document.body.appendChild(helpHandle);
} //function createHelpWindow()

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
    this.pause = function(){
        this.sound.pause();
    } //this.play = function(){
    this.play = function(){
        this.sound.play();
    } //this.play = function(){
    this.stop = function(){
        this.sound.pause();
        this.sound.currentTime = 0;
        isPaused = true;
    }//this.stop = function()    
    this.sound.onended = function () {
        isPaused = true;
        pauseIndicator.style.display = "none";
    }; //sound.onended
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
