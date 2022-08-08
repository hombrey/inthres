#!/bin/bash
ls | sort -n > /tmp/list.txt
input="/tmp/list.txt"
# extract the source directory from the command used to call this script
SOURCEDIR=`echo "${0%/*}"`

echo " ----------"
echo "1 horizontal"
echo "2 vertical"
echo "3 drop"
echo " ----------"
read -p "select style: " selectedStyle
if [[ $selectedStyle == "1" ]]; then
    output="x_horiz.html"
    cssType="horizstyle.css"
    listSize="16"
fi

if [[ $selectedStyle == "2" ]]; then
    output="x_vert.html"
    cssType="vertstyle.css"
    listSize="3"
fi

if [[ $selectedStyle == "3" ]]; then
    output="x_drop.html"
    cssType="dropstyle.css"
    listSize="1"
fi

echo "<!DOCTYPE html>" > $output
echo "<html lang=\"en\">" >> $output
echo "<head>" >> $output
echo "    <meta charset=\"UTF-8\">" >> $output
echo "    <link rel=\"stylesheet\" href=\"$SOURCEDIR/$cssType\">" >> $output
echo "</head>" >> $output
echo "" >> $output
echo "<body id=\"myBody\">" >> $output
echo "    <img class=\"fullPage\" id=\"backgroundX\" src=\"$SOURCEDIR/img/BG0.png\">" >> $output
echo "    <video src=\"$SOURCEDIR/img/init.mp4\" id=\"vidPicked\" onmouseover=\"initVidPlayer(this.id)\"></video>" >> $output
echo "    <div id=\"directory\" style=\"display:none\">./</div>" >> $output
echo "    <div id=\"pickerDiv\" class=\"selector\">" >> $output
echo "    <select id=\"filePicker\" onchange=\"switchVid(this.id,directory.id)\" size=$listSize>  <!--Call run() function-->" >> $output

#add an empty first selection in drop down style
if [[ $selectedStyle == "3" ]]; then
          echo "        <option></option>" >> $output 
fi

while IFS= read -r line
do
    EVAL=`echo " \"$line\" "`
    if [[ $EVAL == *"mp4"* || $EVAL == *"avi"* || $EVAL == *"webm"* ]]; then
          echo "        <option>$line</option>" >> $output 
    fi
done < "$input"

echo "    </select>" >> $output
echo "    </div>" >> $output
echo "</body> " >> $output
echo "    <script src=\"$SOURCEDIR/functions.js\"></script> " >> $output
echo "</html> " >> $output

#rm /tmp/list.txt
