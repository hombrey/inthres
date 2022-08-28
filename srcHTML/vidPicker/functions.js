//{{{variable declarations
"use strict";
let bgX;
let scaleX, scaleY;

let clickedVid;
let osdTimeout = 3000;
let osdTimer;
let vidOSD;
let playRate = 1;
let isVidInitiated=false;
let isVidMax=false;
let isVidFullScreen;
let sourceDir;
let helpHandle;
let isPenToolHidden=true;

;//}}}variable declarations

//{{{event listeners
window.onload = initWin();
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
    let rateIncValue = 0.2;
    //console.log ("keyUp: ",keyPressed);
    switch (keyPressed) {
        case 32 :  evnt.preventDefault();
                   if (clickedVid.paused) {clickedVid.play(); clickedVid.setAttribute("controls","controls") ;}
                   else {clickedVid.pause();clickedVid.removeAttribute("controls");};
                   break; //spaebar
        case 219 : evnt.preventDefault();
                   playRate -= rateIncValue;
                   if (playRate < 0.1) playRate = 0.1;
                   playRate = parseFloat(playRate.toFixed(2));
                   clickedVid.playbackRate = playRate;
                   if (osdTimeout > 0) showOSD(clickedVid.playbackRate);
                   break; //'['
        case 221 : evnt.preventDefault();
                   playRate += rateIncValue;
                   if (playRate > 16) playRate = 16;
                   playRate = parseFloat(playRate.toFixed(2));
                   clickedVid.playbackRate = playRate;
                   if (osdTimeout > 0) showOSD(clickedVid.playbackRate);
                   break; // ']'
        case 190 : evnt.preventDefault();
                   clickedVid.pause();
                   clickedVid.currentTime+=0.1;
                   break; // '<period>'
        case 188 : evnt.preventDefault();
                   clickedVid.pause();
                   clickedVid.currentTime-=0.1;
                   break; // '<comma>'
        case 37 : evnt.preventDefault();
                   clickedVid.currentTime-=5;
                   break; // '<left>'
        case 39 : evnt.preventDefault();
                   clickedVid.currentTime+=5;
                   break; // '<right>'
        case 84 :  toggleVidMax(evnt);
                   break; // 't'
        case 77 :  if (!clickedVid.muted) clickedVid.muted=true; else clickedVid.muted=false;
                   showOSD("mute: "+clickedVid.muted);
                   break; // 'm'
        //case 70 :  if(event.ctrlKey) toggleVidFullScreen(evnt); //if (event.ctrlKey)
        case 70 :  if(!event.ctrlKey) toggleVidFullScreen(evnt); //if
                   break; // 'f'
        case 86 : document.getElementById("filePicker").focus(); break; //key: v -- focus on video picker frame
       case 87  : if(!event.shiftKey) parent.postMessage("FocusSeq","*");
                  else parent.postMessage("FocusTool","*"); 
                  break; //key: w
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
        document.getElementById('filePicker').focus();
    }
} //function evalMessage(event)

//}}}event listeners

//{{{initializations

async function initWin() {
    await delay (20);

    //Get a reference to the canvas
    bgX = document.getElementById('backgroundX');
    clickedVid = document.getElementById("vidPicked");
    document.getElementById("vidPicked").className = "vidNonMax";

    scaleX = bgX.clientWidth/bgX.naturalWidth;
    scaleY = bgX.clientHeight/bgX.naturalHeight;

    //document.getElementById("filePicker").focus();
    //const pickerElement=document.getElementById("filePicker");

    //extract sourceDir from location of the background image.
    let extString = bgX.src;
    sourceDir= extString.split('/').slice(0, -2).join('/')+'/';  // remove last filename part of path

    createHelpWindow();
    createPentool();

    await delay (3);

} //function init()

//}}}window init

//{{{handler functions
function switchVid(callID,callID2) {   // txt == content of form input
    let filePicked = document.getElementById(callID).value;
    let directory = document.getElementById(callID2).innerHTML;
    let fullPath=directory+filePicked;
    //console.log("FileLocation: " + directory+filePicked);
    //console.log("FileLocation: " + fullPath);
    clickedVid.setAttribute ('src',fullPath);

}//function switchVid

function initVidPlayer(clicked_id) {
    isVidInitiated = true;
    clickedVid = document.getElementById(clicked_id);
    //clickedVid.setAttribute("controls","controls") ; 
    window.addEventListener("keydown", evalCtrlKey, false);
    clickedVid.onended = function() {clickedVid.removeAttribute("controls");};
} //function initVidPlayer(id)

function closeVidPlayer() { 
    if (isVidInitiated) {
        clickedVid.removeAttribute("controls");
        window.removeEventListener("keydown", evalCtrlKey);
        playRate = 1;
        clickedVid.playbackRate = playRate;
    } //if (isVidInitiated)
} //function closeVidPlayer()

function evalCtrlKey(evnt) {
       let keyPressed = evnt.keyCode;
} //function evalCtrlKey()

function toggleVidMax(evnt){
    if (!isVidMax){
        document.getElementById("vidPicked").className = "vidMax";
        //document.getElementById("pickerDiv").className = "selectorMin";
        isVidMax = true;
    }//if (!isVidMax)
    else {
        document.getElementById("vidPicked").className = "vidNonMax";
        //document.getElementById("pickerDiv").className = "selector";
        isVidMax = false;
    } //else of isVidMax
}//function toggleVidMax

async function toggleVidFullScreen(evnt) {
    evnt.preventDefault();
    if (!isVidFullScreen){
        if (clickedVid.requestFullscreen) { clickedVid.requestFullscreen(); }
        else if (clickedVid.webkitRequestFullScreen) { clickedVid.webkitRequestFullScreen(); }
        isVidFullScreen = true;
    }//if (!isFullScreen)
    else {
        if (clickedVid.exitFullscreen) { clickedVid.exitFullscreen(); } 
        else if (clickedVid.webkitExitFullscreen) { clickedVid.webkitExitFullscreen(); }
        isVidFullScreen = false;
        
        //return focus to element after extiing from fullscreen
        await delay (200);
        document.getElementById("filePicker").focus();
    } //else of isfullScreen
                   
} //function toggleFullScreen()

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

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    } //this.play = function(){
    this.stop = function(){
        this.sound.pause();
    }//this.stop = function(){    
}//function sound(src)

function insertCss( code ) {
    var style = document.createElement('style');
    style.innerHTML = code;

    document.getElementsByTagName("head")[0].appendChild( style );
} //function insertCss( code)

function showOSD(rate) {
    if (vidOSD) {
        vidOSD.textContent = rate + "X";
    } else {
        vidOSD = document.createElement("DIV");
        vidOSD.style.cssText = "position:fixed;z-index:999999999;right:5px;bottom:5px;margin:0;padding:5px;width:auto;height:auto;font:bold 10pt/normal monospace;background:#444;color:#fff";
        vidOSD.textContent = rate + "X";
        document.body.appendChild(vidOSD);
    } // if (vidOSD)
    clearTimeout(osdTimer);
    osdTimer = setTimeout(function() {
        vidOSD.remove();
        vidOSD = null;
    }, osdTimeout);
} // function showOSD(rate)

function delay(n) {  
        n = n || 2000;
        return new Promise(done => {
                setTimeout(() => {
                        done();
                        }, n);
            });
}//function delay()

//}}}helper functions
