//{{{variable declarations
"use strict";
let bgX;
let scaleX, scaleY;
let piece1;
let pieces;
let pickedNum=1;
let pickSound,cardSound;
let xAdj, yAdj;
let assetDir,sourceDir;
let isPenToolHidden=true;
let helpHandle;
//}}}variable declarations

//{{{window init

window.onload = initWin();
window.addEventListener("resize", initWin);

//make sure elements are loaded before proceeding
const checkElement = async selector => {
  while ( document.querySelector(selector) === null) {
    await new Promise( resolve =>  requestAnimationFrame(resolve) )
  } //while ( document.querySelector(selector) === null)
  return document.querySelector(selector); 
}; //const checkElement = async selector

async function initWin() {
    await delay (30);

    window.addEventListener("keyup", evalKeyUp, false); //capture keypress on bubbling (false) phase
    window.addEventListener("keydown", evalKeyDown, false); //capture keypress on bubbling (false) phase
    window.addEventListener("contextmenu", movePiece, false); //capture keypress on bubbling (false) phase
    window.addEventListener("keydown", evalDownCommon, false); //capture keypress on bubbling (false) phase
    window.addEventListener("keyup", evalUpCommon, false); //capture keypress on bubbling (false) phase
    //Get project source
    sourceDir = document.getElementById("srcdir").innerHTML;

    //Get location of lesson assets
    assetDir = document.getElementById("assetdir").innerHTML;
    
    //Get a reference to the canvas
    bgX = document.getElementById('backgroundX');
    
    scaleX = bgX.clientWidth/bgX.naturalWidth;
    scaleY = bgX.clientHeight/bgX.naturalHeight;
    //console.log ("scale: ("+scaleX+","+scaleY+")");

    await delay (90);

    placeLocations(); //define number of pieces and their unscaled positions here

    for (let pInx=1; pInx<pieces.length+1; pInx++) {
        //console.log ("pInx: ",pInx);
        pieces[pInx-1].Width = Math.round (scaleX*pieces[pInx-1].naturalWidth);
        pieces[pInx-1].Height = Math.round (scaleY*pieces[pInx-1].naturalHeight);
        insertCss ("#piece"+pInx+" {width: "+ pieces[pInx-1].Width +"px; height: "+ pieces[pInx-1].Height +"px;}");

        pieces[pInx-1].X = Math.round (scaleX*pieces[pInx-1].pickX);
        pieces[pInx-1].Y = Math.round (scaleY*pieces[pInx-1].pickY);
        
        insertCss ("#piece"+pInx+"{left: "+ pieces[pInx-1].X +"px; top: "+ pieces[pInx-1].Y +"px;}");

        insertCss ("#piece"+pInx+"{z-index: 1;}");
        pieces[pInx-1].show = true;
        //Make the DIV element draggagle:
        xAdj =(-1)*Math.round(pieces[pInx-1].Width/2);
        yAdj =(-1)*Math.round(pieces[pInx-1].Height/2);
        dragElement(document.getElementById("piece"+pInx));
        touchElement(document.getElementById("piece"+pInx));

        //console.log ("#piece"+pInx+"{left: "+ pieces[pInx-1].X +"px; top: "+ pieces[pInx-1].Y +"px;}");
    } //for (pInx=1; pInx=pieces.size+1; pInx+)
    
    pickSound = new sound(sourceDir+"wav/pick.mp3");
    cardSound = new sound(sourceDir+"wav/card.mp3");
    //document.getElementById("dummy").focus(); //dummy select element that grabs the focus of the iframe

     createHelpWindow();
     createPentool();

} //function init()

//}}}window init

//{{{handler functions

function evalUpCommon(evnt) {
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
}//evalUpCommon

function evalDownCommon(evnt) {
    let keyPressed = evnt.keyCode;
    //console.log ("Pressed2:", keyPressed);
    switch (keyPressed) {
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
        document.getElementById('dummy').focus();
    }
} //function evalMessage(event)

function clickPiece(clicked_id) { //handler for mouse clicks
    let extractIdNum = (clicked_id.replace("piece",""));
    let clickedNum = parseInt(extractIdNum);
    pickedNum = clickedNum;
    pickSound.start();
    leavePiece();
    raisePiece();
} //function clickPiece(clicked_id)
function selectPiece(numPassed) { //handler for using the keyboard to select a piece
    pickedNum=numPassed;
    //pickSound.stop();
    pickSound.start();
    raisePiece();
    //insertCss (".pieceClass {transition: 0ms;}"); 
} //function selectPiece(pieceNum)
function placePiece(numPassed) {
    pieces[pickedNum-1].style.left = Math.round (scaleX*pieces[numPassed-1].placeX)+'px';
    pieces[pickedNum-1].style.top = Math.round (scaleY*pieces[numPassed-1].placeY)+'px';
    pickSound.start();
} //function selectPiece(pieceNum)
function resetPiece() {
    pickSound.start();
    pieces[pickedNum-1].style.left = Math.round (scaleX*pieces[pickedNum-1].pickX)+'px';
    pieces[pickedNum-1].style.top = Math.round (scaleY*pieces[pickedNum-1].pickY)+'px';
    pieces[pickedNum-1].angle = 0;
    pieces[pickedNum-1].style.transform = "rotate("+pieces[pickedNum-1].angle+"deg)";
} //function selectPiece(pieceNum)
function rotatePiece(rotation) {
    cardSound.start();
    pieces[pickedNum-1].angle+=rotation;
    if (pieces[pickedNum-1].angle == 360) pieces[pickedNum-1].angle = 0;
    if (pieces[pickedNum-1].angle == -90) pieces[pickedNum-1].angle = 270;
    pieces[pickedNum-1].style.transform = "rotate("+pieces[pickedNum-1].angle+"deg)";
} //function rotatePiece()
function resetAll() {
    pickSound.start();
    for (let pInx=1; pInx<pieces.length+1; pInx++) {
        pieces[pInx-1].style.left = Math.round (scaleX*pieces[pInx-1].pickX)+'px';
        pieces[pInx-1].style.top = Math.round (scaleY*pieces[pInx-1].pickY)+'px';
        pieces[pInx-1].angle = 0;
        pieces[pInx-1].style.transform = "rotate("+pieces[pInx-1].angle+"deg)";
    } //for (pInx=1; pInx=pieces.size+1; pInx+)
} //function resetAll()

// this randomly shuffles the pick locations of the pieces
function shufflePick(lastNum,shuffleSource) {
    //lastNum = 2 //for piece sets with angryCat FC
    //lastNum = 1 //shuffle all pieces.

    var createIndx;
    var numArray= [];
    var iShuf, jShuf,tempShuf;
    var pickIndx;

    cardSound.start();
   
    //create number array
    for (createIndx = pieces.length - lastNum; createIndx >= 0; createIndx--)   numArray.push(createIndx);
    
    //shuffle contents of array
    for (iShuf = numArray.length - 1; iShuf > 0; iShuf--)  {
        jShuf = Math.floor(Math.random() * (iShuf+1));
        tempShuf = numArray[iShuf];
        numArray[iShuf] = numArray[jShuf];
        numArray[jShuf] = tempShuf;
    } //for (iShuf = numArray.length - 1; iShuf > 0; iShuf--) 
    //console.log(numArray);

    //populate contents of pick array from place locations indexed by shuffled number array
    for (pickIndx = numArray.length - 1; pickIndx >= 0; pickIndx--) {
        //
        //console.log ("locX:"+pieces[numArray[pickIndx]].placeX);
        //console.log ("locY:"+pieces[numArray[pickIndx]].placeY);

        if (shuffleSource == "pick") {
            pieces[pickIndx].shuffX = pieces[numArray[pickIndx]].pickX;
            pieces[pickIndx].shuffY = pieces[numArray[pickIndx]].pickY;
        } else {
            pieces[pickIndx].shuffX = pieces[numArray[pickIndx]].placeX;
            pieces[pickIndx].shuffY = pieces[numArray[pickIndx]].placeY;
        } // if (shuffleSource)

        //console.log ("shuffX:"+pieces[numArray[pickIndx]].shuffX);
        //console.log ("shuffY:"+pieces[numArray[pickIndx]].shuffY);
    //
    } //for (pickIndx = numArray.length - 1; pickIndx > 0; pickIndx--)

    //move pieces to the shuffled locations
    for (pickIndx=1; pickIndx<(pieces.length+1); pickIndx++) {
        pieces[pickIndx-1].style.left = Math.round (scaleX*pieces[pickIndx-1].shuffX)+'px';
        pieces[pickIndx-1].style.top = Math.round (scaleY*pieces[pickIndx-1].shuffY)+'px';
        pieces[pickIndx-1].angle = 0;
        pieces[pickIndx-1].style.transform = "rotate("+pieces[pickIndx-1].angle+"deg)";
    } //for (pickIndx=1; pickIndx=pieces.size+1; pickIndx+)

} //function shufflePick()

function movePiece() {
    window.addEventListener("mousemove",followMouse);
    insertCss (".pieceClass {transition: 0ms;}"); 
    //console.log("picked", pickedNum); 
} //function leavePiece()
function leavePiece() {
    //pickSound.start();
    window.removeEventListener("mousemove",followMouse);
    insertCss (".pieceClass {transition: 100ms;}"); 
} //function leavePiece()
function followMouse() { //activated by spacebar
    let x = event.clientX+xAdj;
    //let y = event.clientY+yAdj;
    let y = event.clientY; //removed Y offset so slow reveal can be done. using bottom edge
    pieces[pickedNum-1].style.left = x+'px';
    pieces[pickedNum-1].style.top = y+'px';
} //function followMouse()

function playPrompt() {
    pieces[pickedNum-1].prompt.start();
} //function playPrompt()
function toggleHide() {
    if (pieces[pickedNum-1].show) {
        pieces[pickedNum-1].src =assetDir+"2_back/"+pickedNum+".webp";
        pieces[pickedNum-1].show=false;
    } else {//if (pieces[pickedNum-1].show)
        pieces[pickedNum-1].src =assetDir+"1_front/"+pickedNum+".webp";
        pieces[pickedNum-1].show=true;
    } // else //if (pieces[pickedNum-1 ...
} //function toggleHide()
function hideAll() {
    for (let pInx=1; pInx<pieces.length+1; pInx++) {
        pieces[pInx-1].src =assetDir+"2_back/"+pInx+".webp";
        pieces[pInx-1].show = false;
    } //for (pInx=1; pInx=pieces.size+1; pInx+)
} //function hideAll()

//}}}handler functions

//{{{extra functions for the pieces
function raisePiece() {
    for (let pInx=1; pInx<pieces.length+1; pInx++) {
        insertCss ("#piece"+pInx+"{z-index: 1;}");
    } //for (pInx=1; pInx=pieces.size+1; pInx+)
   insertCss ("#piece"+pickedNum+"{z-index: 3;}");
} //function raisePiece(numPassed)

//===========================================================================
function dragElement(elmnt) {
  var dragX = 0, dragY = 0;

    elmnt.onmousedown = dragMouseDown; 

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    dragX = e.clientX+xAdj;
    dragY = e.clientY+yAdj; 
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  } //function dragMouseDown(e)

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    dragX = e.clientX+xAdj;
    dragY = e.clientY+yAdj;
    // set the element's new position:
    elmnt.style.top = ( dragY) + "px";
    elmnt.style.left = (  dragX) + "px";
  } // function elementDrag(e)

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  } //function closeDragElement() 
} //function dragElement(elmnt) 

//===========================================================================
function touchElement(elmnt) {
  var touchX = 0, touchY = 0;

    elmnt.ontouchstart = dragFinger; 

  function dragFinger(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    getTouchPos(e);
    document.ontouchend = closeTouchElement;
    // call a function whenever the cursor moves:
    document.ontouchmove = elementDrag;
  } //function dragFinger(e)

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    getTouchPos(e);

    elmnt.style.top = (touchY) + "px";
    elmnt.style.left = (touchX) + "px";
  } // function elementDrag(e)

  function getTouchPos(e) {
        if(e.touches) {
            if (e.touches.length == 1) { // Only deal with one finger
                var touch = e.touches[0]; // Get the information for finger #1
                touchX=touch.pageX+xAdj/2;
                touchY=touch.pageY+yAdj/2;
            } //if (e.touches.lenth ==1) ...
        } //if (e.touches)
  } //function getTouchPos(e)

  function closeTouchElement() {
    /* stop moving when mouse button is released:*/
    document.ontouchend = null;
    document.ontouchmove = null;
  } //function closeTouchElement() 
} //function touchElement(elmnt) 
//===========================================================================
//}}}extra functions for the pieces

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
