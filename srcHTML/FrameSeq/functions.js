// {{{ variables
let canvas;
let context;
let restore_array = [];
let start_index;
let stroke_color;
let stroke_width;
let is_drawing;
let isWBdark=false;
let IsColorPaneHidden=true;
// }}} variables

// {{{ event listeners
//const canvasC = document.createElement('canvas');
//canvasC.setAttribute("id","canvas");
//document.body.appendChild(canvasC);

window.onload = initWin();
window.addEventListener("resize", initWin);
window.addEventListener('message', evalMessage);
window.addEventListener("keydown", evalKeyDown, false); //capture keypress on bubbling (false) phase

function evalMessage (evnt) {
    // Get the sent data
    var data = evnt.data;
    //console.log ("message received");

    switch (data) {
      case "FocusSeq" : document.getElementById('seqSelect').focus(); break;
      case "FocusTool" : document.getElementById('toolSelect').focus(); break;
      default : return;
    } //switch (data)

    canvas.addEventListener("touchstart", start, false);
    canvas.addEventListener("touchmove", draw, false);
    canvas.addEventListener("touchend", stop, false);
    canvas.addEventListener("mousedown", start, false);
    canvas.addEventListener("mousemove", draw, false);
    canvas.addEventListener("mouseup", stop, false);
    canvas.addEventListener("mouseout", stop, false);
    window.addEventListener("keydown", drawKeys, false);
    canvas.className = "canvasTap";

} //function evalMessage(event)

function evalKeyDown(evnt) {
    let keyPressed = evnt.keyCode;
    //console.log ("keyUp: ",keyPressed);
    switch (keyPressed) {
       case 87  : if (!event.shiftKey) focusIframe(); 
                  else document.getElementById('toolSelect').focus();
                  break; //key: w
       case 82  : window.location.reload(); 
                  break; //key: r
        default : return;
    } //switch (keyPressed)
} //evalKey(event)

function drawKeys(evnt) {
    let keyPressed = evnt.keyCode;
    //console.log ("draw keyUp: ",keyPressed);
    switch (keyPressed) {
       case 66  : toggleWB(); break; //key: b
       case 67  : Clear(); break; //key: c
       case 90  : Restore(); break; //key: z
       case 83  : toggleShowColors(); break; //key: s
       case 49  : if(event.shiftKey) change_color_kb("black"); break; //key: shift 1
       case 50  : if(event.shiftKey) change_color_kb("red"); break;//key: shift 2
       case 51  : if(event.shiftKey) change_color_kb("yellow"); break;//key: shift 3
       case 52  : if(event.shiftKey) change_color_kb("green"); break;//key: shift 4
       case 53  : if(event.shiftKey) change_color_kb("blue"); break;//key: shift 5
       case 54  : if(event.shiftKey) change_color_kb("white"); break;//key: shift 6
        default : return;
    } //switch (keyPressed)
} //drawKeys(event)


// }}} event listeners

//{{{ initializations
const checkElement = async selector => {
  while ( document.querySelector(selector) === null) {
    await new Promise( resolve =>  requestAnimationFrame(resolve) )
  } //while ( document.querySelector(selector) === null)
  return document.querySelector(selector); 
}; //const checkElement = async selector

async function initWin() {

    await delay (25);
    //check to see if element is loaded
    checkElement('backgroundX').then((selector) => { console.log(selector); });

    //BEGIN: create HTML elements for drawing functionality
        canvas = document.createElement('canvas');
        canvas.setAttribute("id","canvas");
        document.body.appendChild(canvas);

        const divtoolC = document.createElement('div');
        divtoolC.setAttribute('id','pentool');
        divtoolC.setAttribute('class','hiddenTool');
        document.body.appendChild(divtoolC);

        const undoButtonC = document.createElement('button');
        undoButtonC.setAttribute('id','undoButton'); undoButtonC.setAttribute('class','stroke-color');
        undoButtonC.setAttribute('onclick','Restore()');
        undoButtonC.innerHTML="Z";
        divtoolC.appendChild(undoButtonC);

        const clearButtonC = document.createElement('button');
        clearButtonC.setAttribute('id','clearButton'); clearButtonC.setAttribute('class','stroke-color');
        clearButtonC.setAttribute('onclick','Clear()');
        clearButtonC.innerHTML="C";
        divtoolC.appendChild(clearButtonC);

        const c1ButtonC = document.createElement('button');
        c1ButtonC.setAttribute('id','color1'); c1ButtonC.setAttribute('class','stroke-color');
        c1ButtonC.setAttribute('style','background:black'); c1ButtonC.setAttribute('onclick','change_color(this)');
        c1ButtonC.innerHTML="\u{2191}1";
        divtoolC.appendChild(c1ButtonC);

        const c2ButtonC = document.createElement('button');
        c2ButtonC.setAttribute('id','color2'); c2ButtonC.setAttribute('class','stroke-color');
        c2ButtonC.setAttribute('style','background:red'); c2ButtonC.setAttribute('onclick','change_color(this)');
        c2ButtonC.innerHTML="\u{2191}2";
        divtoolC.appendChild(c2ButtonC);

        const c3ButtonC = document.createElement('button');
        c3ButtonC.setAttribute('id','color3'); c3ButtonC.setAttribute('class','stroke-color');
        c3ButtonC.setAttribute('style','background:yellow'); c3ButtonC.setAttribute('onclick','change_color(this)');
        c3ButtonC.innerHTML="\u{2191}3";
        divtoolC.appendChild(c3ButtonC);

        const c4ButtonC = document.createElement('button');
        c4ButtonC.setAttribute('id','color4'); c4ButtonC.setAttribute('class','stroke-color');
        c4ButtonC.setAttribute('style','background:green'); c4ButtonC.setAttribute('onclick','change_color(this)');
        c4ButtonC.innerHTML="\u{2191}4";
        divtoolC.appendChild(c4ButtonC);

        const c5ButtonC = document.createElement('button');
        c5ButtonC.setAttribute('id','color5'); c5ButtonC.setAttribute('class','stroke-color');
        c5ButtonC.setAttribute('style','background:blue'); c5ButtonC.setAttribute('onclick','change_color(this)');
        c5ButtonC.innerHTML="\u{2191}5";
        divtoolC.appendChild(c5ButtonC);

        const c6ButtonC = document.createElement('button');
        c6ButtonC.setAttribute('id','color6'); c6ButtonC.setAttribute('class','stroke-color');
        c6ButtonC.setAttribute('style','background:white'); c6ButtonC.setAttribute('onclick','change_color(this)');
        c6ButtonC.innerHTML="\u{2191}6";
        divtoolC.appendChild(c6ButtonC);

        const inputC = document.createElement('input');
        inputC.setAttribute('id','slider');
        inputC.setAttribute('type','range');
        inputC.setAttribute('value','2');
        inputC.setAttribute('min','1');
        inputC.setAttribute('max','100');
        inputC.setAttribute('oninput','stroke_width = this.value');
        divtoolC.appendChild(inputC);

        await delay (30);
    //END: create elements for drawing functionality

    //canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context = canvas.getContext("2d");
    context.fillStyle = "transparent";
    context.fillRect(0, 0, canvas.width, canvas.height);

    start_index = -1;
    stroke_color = 'blue';
    stroke_width = "2";
    is_drawing = false;

    //prevent a-z keyboard strokes from selecting another iframe  
    let selectHandle = document.getElementById("seqSelect");
    selectHandle.setAttribute ('onkeydown','IgnoreAlpha(event);');
    selectHandle.setAttribute ('onClick','focusSeqSource();');

    document.getElementById("seqSelect").focus(); //dummy select element that grabs the focus of the iframe


    //add new "new tab tools" to the designated select dropdown element
    let toolHandle = document.getElementById("toolSelect");

    //This adds a callup to the songs folder
    let songsOption = document.createElement ('option');
    songsOption.innerHTML="songs";
    songsOption.value="../../SongsHTML/0_Songs.html";

    toolHandle.add(songsOption);

} //function initWin()

//}}} initializations

// {{{ framer handling functions

function focusIframe() {
    var childWindow = document.getElementById("myIframe");

    childWindow.contentWindow.postMessage("FocusIframe","*"); 

    canvas.removeEventListener("touchstart", start, false);
    canvas.removeEventListener("touchmove", draw, false);
    canvas.removeEventListener("touchend", stop, false);
    canvas.removeEventListener("mousedown", start, false);
    canvas.removeEventListener("mousemove", draw, false);
    canvas.removeEventListener("mouseup", stop, false);
    canvas.removeEventListener("mouseout", stop, false);
    window.removeEventListener("keydown", drawKeys, false);
    canvas.className = "canvasNoTap"; isWBdark=false;

} //function focusIframe()

async function focusSeqSource() {
    var theSelect = document.getElementById('seqSelect');
    var theIframe = document.getElementById('myIframe');
    var theUrl;
    theUrl = theSelect.options[theSelect.selectedIndex].value;
    theIframe.src = theUrl;

    await delay (100);

    focusIframe();
}


// }}} framer handling functions

// {{{ draw functions

function toggleWB() {
    if (isWBdark) {
        canvas.className = "canvasTap";
        isWBdark=false;
    } else { 
        canvas.className = "canvasWB";
        isWBdark=true;
    } //if (isWBdark)
} //function toggleWB

function toggleShowColors() {
    if (IsColorPaneHidden) {
        //console.log ("show pane");
        document.getElementById("pentool").className = "unhiddenTool";
        IsColorPaneHidden=false;
    } else {
        //console.log ("hide pane");
        document.getElementById("pentool").className = "hiddenTool";
        IsColorPaneHidden=true;
    } //if hideColorPane
} //function toggleShowColors

function change_color_kb(color) {
        stroke_color = color;
} //function change_color 

function change_color(element) {
        stroke_color = element.style.background;
} //function change_color 

function change_width(element) {
  stroke_width = element.innerHTML
} //function change_width

function start(event) {
  is_drawing = true;
  context.beginPath();
  context.moveTo(getX(event), getY(event));
  event.preventDefault();
} //function start

function draw(event) {
  if (is_drawing) {
    context.lineTo(getX(event), getY(event));
    context.strokeStyle = stroke_color;
    context.lineWidth = stroke_width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  } //if (is_drawing)
  event.preventDefault();
} //function draw

function stop(event) {
  if (is_drawing) {
    context.stroke();
    context.closePath();
    is_drawing = false;
  } // if (is_drawing)
  event.preventDefault();
  restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
  start_index += 1;
} //function stop

function getX(event) {
  if (event.pageX == undefined) {return event.targetTouches[0].pageX - canvas.offsetLeft}
  else{return event.pageX - canvas.offsetLeft}
  } //function getX


function getY(event) {
  if (event.pageY == undefined) {return event.targetTouches[0].pageY - canvas.offsetTop}
  else {return event.pageY - canvas.offsetTop}
} //function getY

function Restore() {
  if (start_index <= 0) {
    Clear()
  } else {
    start_index += -1;
    restore_array.pop();
    if ( event.type != 'mouseout' ) {
      context.putImageData(restore_array[start_index], 0, 0);
    } // if (event.type ! = 'mouseout' )
  } //if (start_index <= 0)
} //funciton Restore

function Clear() {
    //context.fillStyle = "white";
    context.fillStyle = "transparent";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);
    restore_array = [];
    start_index = -1;
} //function Clear

// }}} draw functions

//{{{helper functions
function IgnoreAlpha(e) {
  if (!e) { e = window.event; }
  if (e.keyCode >= 65 && e.keyCode <= 90) // A to Z
    { e.returnValue = false; e.cancel = true; }
} //function IgnoreAlpha(e)

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
