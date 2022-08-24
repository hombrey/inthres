#!/bin/bash

# extract the source directory from the command used to call this script
SOURCEDIR=`echo "${0%/*}"`
SOURCEROOT=`echo "${0%/*/*}"`
SOURCEPREROOT=`echo "${0%/*/*/*}"`
LESSONDIR=`pwd`

echo "    <!--{{{head-->" > 0_FrameX.html
echo "<!DOCTYPE html>" >> 0_FrameX.html
echo "<html lang=\"en\">" >> 0_FrameX.html
echo "<head>" >> 0_FrameX.html
echo "    <script src=\"$SOURCEDIR/functions.js\"></script> " >> 0_FrameX.html
echo "    <script type=\"text/javascript\">" >> 0_FrameX.html
echo "        function setSeqSource() {" >> 0_FrameX.html
echo "            var theSelect = document.getElementById('seqSelect');" >> 0_FrameX.html
echo "            var theIframe = document.getElementById('myIframe');" >> 0_FrameX.html
echo "            var theUrl;" >> 0_FrameX.html
echo "            theUrl = theSelect.options[theSelect.selectedIndex].value;" >> 0_FrameX.html
echo "            theIframe.src = theUrl;" >> 0_FrameX.html
echo "        }" >> 0_FrameX.html
echo "        function setToolSource(urlvalue) {" >> 0_FrameX.html
echo "            window.open(urlvalue,'_blank');" >> 0_FrameX.html
echo "        }" >> 0_FrameX.html
echo "    </script>" >> 0_FrameX.html
echo "    <link rel=\"stylesheet\" href=\"$SOURCEDIR/styles.css\">" >> 0_FrameX.html
echo "</head>" >> 0_FrameX.html
echo "    <!--}}}head-->" >> 0_FrameX.html
echo "<body>" >> 0_FrameX.html
echo "    <!--{{{outerFrame-->" >> 0_FrameX.html
echo " <img class=\"fullPage\" id=\"backgroundX\" src=\"$SOURCEDIR/background.jpg\">" >> 0_FrameX.html
echo " <iframe class=\"subframe\" id=\"myIframe\" src=\"$SOURCEPREROOT/SongsHTML/A_hi/x_horiz.html\"></iframe>" >> 0_FrameX.html
echo "" >> 0_FrameX.html
echo "    <select id=\"toolSelect\" onClick=\"setToolSource(this.value)\" size=1 autofocus> " >> 0_FrameX.html

echo "      <option value=\"$SOURCEROOT/Klyne/klyne.html\">Klyne</option> " >> 0_FrameX.html
echo "      <option value=\"./\">localDir</option> " >> 0_FrameX.html
echo "   </select>" >> 0_FrameX.html
echo "    <!--}}}outerFrame-->" >> 0_FrameX.html

echo "    <select id=\"seqSelect\" onChange=\"setSeqSource()\" size=1> " >> 0_FrameX.html
echo "        <option value=\"$SOURCEPREROOT/SongsHTML/A_hi/x_horiz.html\">0_hello</option> " >> 0_FrameX.html
case $LESSONDIR in
    *"LI1_Mam"*)
        echo "        <option value=\"$SOURCEPREROOT/SongsHTML/A_hi/L1/x_horiz.html\">3_WarmUp</option> " >> 0_FrameX.html
    ;;
    *"LI2_Choi"*)
        echo "        <option value=\"$SOURCEPREROOT/SongsHTML/A_hi/L2/x_horiz.html\">3_WarmUp</option> " >> 0_FrameX.html
    ;;
    *"LI3_La"*)
        echo "        <option value=\"$SOURCEPREROOT/SongsHTML/A_hi/L3/x_horiz.html\">3_WarmUp</option> " >> 0_FrameX.html
esac
echo "        <option value=\"$SOURCEROOT/Klyne/klyne.html\">9_classMgt</option> " >> 0_FrameX.html
echo "" >> 0_FrameX.html

#list html files in lesson plan root directory
ls -d *.html> /tmp/list.txt
input="/tmp/list.txt"
arrayIndex=1;

while IFS= read -r line
do
    EVAL=`echo " \"$line\" "`
    if [[ $EVAL == *"html"* && $EVAL != *"0_"* ]]; then
    echo "        <option value=\"./$line\">leqx</option> " >> 0_FrameX.html
        ((arrayIndex++))
    fi
done < "$input"

#list html files tucked in a subdirectory
ls -d ./*/*.html> /tmp/list.txt
input="/tmp/list.txt"
arrayIndex=1;

while IFS= read -r line
do
    EVAL=`echo " \"$line\" "`
    if [[ $EVAL == *"html"* ]]; then
        #trim trailing text 
        TRIMDIR=`echo "${line%/*}"`
        #trim leading text 
        TRIMDIR=`echo "${TRIMDIR#*/}"`
    echo "        <option value=\"$line\">"$TRIMDIR"</option> " >> 0_FrameX.html
        ((arrayIndex++))
    fi
done < "$input"

echo "" >> 0_FrameX.html
echo "        <option value=\"$SOURCEPREROOT/SongsHTML/Z_bye/x_horiz.html\">30_Bye</option>" >> 0_FrameX.html
echo "   </select>" >> 0_FrameX.html
echo "</body>" >> 0_FrameX.html
echo "</html>" >> 0_FrameX.html
