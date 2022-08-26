//{{{variable declarations
"use strict";
let isDebug=true;
let bgX;
let scaleX, scaleY;
let pickSound;
let placeSound;
let tingSound;
let errSound;
let cardSound;
let tokenInx=0;
let tokens;
let activeTokens;
let steps;
let stepMax, tokenMax;
let boardx,boardy; //unscaled
let boardX,boardY; //scaled
let boardW, boardH;
let steph, stepw; //unscaled
let stepH, stepW; //scaled
let sourceDir, assetDir;
let tokenNow=0,stepNow=0;
let cycleNow=0;
let optionHandle;
let theDie;
let isDieSpinning=false;

//}}}variable declarations

//{{{event listeners
window.onload = initWin();
window.addEventListener("resize", initWin);
window.addEventListener("keydown", evalKeyDown, false); //capture keypress on bubbling (false) phase
function evalKeyDown(evnt) {
    let keyPressed = evnt.keyCode;
    //deblog ("keyDn: "+keyPressed);
    switch (keyPressed) {
       case 87  : if(!event.shiftKey) parent.postMessage("FocusSeq","*");
                  else parent.postMessage("FocusTool","*"); 
                  break; //key: w
        case 49 : selectToken("pick",1); break; //key: 1
        case 50 : selectToken("pick",2); break; //key: 2
        case 51 : selectToken("pick",3); break; //key: 3
        case 52 : selectToken("pick",4); break; //key: 4
        case 53 : selectToken("pick",5); break; //key: 5
        case 39 : stepToken(tokenNow,1); break; //key: right
        case 37 : stepToken(tokenNow,-1); break; //key: left
        case 40 : selectToken("next",1); break; //key: <down>
        case 38 : selectToken("next",-1); break; //key: <up>
        case 68 : toggleDieSpin(); break; //key: d
        case 190 : break; //key: <period> to show/hide pattern
        case 188 : cycleSee(stepNow); break; //key: <comma> to show alt image
        case 32  : evnt.preventDefault(); playStep(stepNow) ;break; //key: <spacebar>
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
    } //focusIframe

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
    await delay (20); 
    //check to see if element is loaded
    checkElement('backgroundX').then((selector) => { console.log(selector); });
    //Get a reference to the canvas
    bgX = document.getElementById('backgroundX');

    scaleX = bgX.clientWidth/bgX.naturalWidth;
    scaleY = bgX.clientHeight/bgX.naturalHeight;

    await delay (100);

    //defined in HTML
    //Get project source
    sourceDir = document.getElementById("srcdir").innerHTML;
    //Get location of lesson assets
    assetDir = document.getElementById("assetdir").innerHTML;
    //populate tokens and steps arrays and define unscaled step offsets
    arrangeBoard();
    //
    boardX = Math.round (scaleX*boardx);
    boardY = Math.round (scaleY*boardy);
    boardW = Math.round (scaleX*steps[1].naturalWidth);
    boardH = Math.round (scaleY*steps[1].naturalHeight);

    //deblog ("x:"+theDie.x);
    theDie.X = Math.round (scaleX*theDie.placex);
    theDie.Y = Math.round (scaleY*theDie.placey);
    theDie.W = Math.round (scaleX*theDie.naturalWidth);
    theDie.H = Math.round (scaleY*theDie.naturalHeight);

    insertCss ("#die1 {width: "+ theDie.W +"px; height: "+ theDie.H +"px;}");
    insertCss ("#die1 {left: "+ theDie.X +"px; top: "+ theDie.Y +"px;}");

    //place board steps
   for (let sInx=0; sInx<stepMax+1; sInx++) {

        //visually, all steps are positioned at the the same location of the backboard
        insertCss ("#step"+sInx+" {width: "+ boardW +"px; height: "+ boardH +"px;}");
        insertCss ("#step"+sInx+"{left: "+ boardX +"px; top: "+ boardY +"px;}");
       
        //adjust size and positions of steps
        stepW = Math.round (scaleX*stepw);
        stepH = Math.round (scaleY*steph);
        steps[sInx].X = Math.round (scaleX*steps[sInx].posx*stepw)+boardX;
        steps[sInx].Y = Math.round (scaleY*steps[sInx].posy*steph)+boardY;
        
   } //for (let sInx=1; sInx<stepMax+1; sInx++)

   //adjust size,positions, and offsets  of steps
   for (let tInx=1; tInx<tokenMax+1; tInx++) {

        tokens[tInx].W = Math.round (scaleX*tokens[tInx].naturalWidth);
        tokens[tInx].H = Math.round (scaleY*tokens[tInx].naturalHeight);
        tokens[tInx].offX = Math.round (scaleX*tokens[tInx].offx);
        tokens[tInx].offY = Math.round (scaleY*tokens[tInx].offy);
        
        insertCss ("#token"+tInx+" {width: "+ tokens[tInx].W +"px; height: "+ tokens[tInx].H +"px;}");

        insertCss ("#token"+tInx+"{"+
            " left: "+(steps[tokens[tInx].onStep].X+tokens[tInx].offx) +"px;"+
            " top: "+ (steps[tokens[tInx].onStep].Y+tokens[tInx].offy) +"px;"+
        "}"); //insertCss "#token"

   } //for (let tInx=1; sInx<tokenMax+1; tInx++)

        optionHandle = document.getElementById('optionText');

    pickSound = new sound(sourceDir+"wav/pick.mp3");
    placeSound = new sound(sourceDir+"wav/place.mp3");
    cardSound = new sound(sourceDir+"wav/card.mp3");


} //function initWin()

//}}}initializations

//{{{handler functions

function clickStep(clicked_id) {
    //deblog(clicked_id);
    cycleSee(stepNow);
} //clickStep

function clickToken(clicked_id) {
    let extractIdNum = (clicked_id.replace("token",""));
    selectToken("pick",extractIdNum);
} //selectToken(action,tokenInt)

function selectToken(action,tokenInt) {

    var searchActive;
    var countSearch=0;
    //deblog ("tokenMax:"+tokenMax);
    
    //reset previous token size
    //insertCss ("#token"+tokenNow+" {width: "+ tokens[tokenNow].W +"px; height: "+ tokens[tokenNow].H +"px;}");
    tokens[tokenNow].className="tokenClass";

    switch (action) {
       case "pick": tokenNow = tokenInt;
                    break;
        case "next": var searchIndex=tokenNow;
                    do { countSearch++;
                        searchIndex=searchIndex+tokenInt;
                            if (searchIndex>tokenMax) searchIndex = 1; 
                            if (searchIndex<1) searchIndex = tokenMax; 
                        searchActive = activeTokens[searchIndex]; 
                        //deblog("search:"+searchActive);
                    } while ( (searchActive == 0) && (countSearch<tokenMax+1) )//case "next":do 
                    tokenNow = searchActive;
                    break;
        default : return;
    } //switch (action)

    //enlarge active token
    //insertCss ("#token"+tokenNow+" {width: "+ tokens[tokenNow].W*1.35 +"px; height: "+ tokens[tokenNow].H*1.35 +"px;}");
    tokens[tokenNow].className="tokenActiveClass";

    //reset step before specifying a new "stepNow"
   resetSeeCycle(stepNow);
   stepNow=tokens[tokenNow].onStep; 
   resetDie();

   optionHandle.innerHTML="player:"+tokenNow; 

} //selectToken(action,tokenInt)

function stepToken(tokenInt, moveBy) {

    //if no token has ever been selected yet, do nothing
    if (tokenInt == 0) return;

    tokens[tokenInt].onStep=tokens[tokenInt].onStep+moveBy;
        if (tokens[tokenInt].onStep<0) tokens[tokenInt].onStep=0;
        if (tokens[tokenInt].onStep>stepMax) tokens[tokenInt].onStep=stepMax;

    //reset step before specifying a new "stepNow"
    resetSeeCycle(stepNow);
    stepNow=tokens[tokenInt].onStep; 
    
    //include token in active array if it's visible on the board
    if (stepNow>0) 
        activeTokens[tokenInt]=tokenInt;
    else 
        activeTokens[tokenInt]=0;

    //deblog ("stepNow: "+stepNow);

    insertCss ("#token"+tokenInt+"{"+
        " left: "+(steps[stepNow].X+tokens[tokenInt].offX) +"px;"+
        " top: "+ (steps[stepNow].Y+tokens[tokenInt].offY) +"px;"+
    "}"); //insertCss "#token"

    pickSound.start();

} //stepToken(tokenInt, moveBy)

function cycleSee(stepInt) {
    cycleNow++;
    if (cycleNow>2) cycleNow = 0;

    switch (cycleNow) {
    case 0 : resetSeeCycle(stepInt);
             break;
    case 1 : steps[stepInt].src=assetDir+"2b_step/"+stepInt+".webp";
             steps[stepInt].prompt.sound.src=assetDir+"wav/2b/step"+stepInt+".mp3";
             steps[stepInt].className = "stepSeeClass";
             break;
    case 2 : steps[stepInt].src=assetDir+"2c_step/"+stepInt+".webp";
             steps[stepInt].prompt.sound.src=assetDir+"wav/2c/step"+stepInt+".mp3";
             break;
    default: return;
    } //switch (cycleNow)

    steps[stepNow].onerror = function ()  {
        resetSeeCycle(stepInt);
    } //bgX.onerror = function () 

} //cycleSee(tokenInt)

function resetSeeCycle(stepInt) {
    cycleNow = 0;
    steps[stepInt].src=assetDir+"2a_step/"+stepInt+".webp";
    steps[stepInt].prompt.sound.src=assetDir+"wav/2a/step"+stepInt+".mp3";
    steps[stepInt].className = "stepClass";
    //insertCss ("#step"+tokens[tokenInt].onStep+"{z-index: 1;}");
    //
} //function resetSeeCycle(tokenNow)

function playStep(stepInt) {

    steps[stepInt].prompt.start();

} //function playStep(stpeInt)

function resetDie() {
        theDie.src=sourceDir+"img/die"+0+".webp";
} //function.resetDie()

function toggleDieSpin() {
    var dieNum;
    if (isDieSpinning)  {
        //get any integer from 1 to TheDie.maxDie
        dieNum = Math.floor(Math.random()*(theDie.maxDie))+1;
        theDie.src=sourceDir+"img/die"+dieNum+".webp";
        if (theDie.auto) stepToken(tokenNow,dieNum)
        isDieSpinning=false
    } else { //of (isDieSpinning)
        theDie.src=sourceDir+"img/dieSpin.webp";
        isDieSpinning=true;
    } //if (isDieSpinning) 
} //function toggleDieSpin()
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

function deblog(msgLog) {
    if (isDebug) console.log(msgLog);
} //function deblog(msgLog)

//}}}helper functions
