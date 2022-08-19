#!/bin/bash
ls | sort -n > /tmp/list.txt
input="/tmp/list.txt"
optionsList="/tmp/optionlist.txt"
# extract the source directory from the command used to call this script
SOURCEDIR=`echo "${0%/*}"`

echo " ----------"
echo "h) horizontal"
echo "v) vertical"
echo "d) drop"
echo " ----------"
read -p "select style: " selectedStyle

# BEGIN: enclose list of vid files in select tag and place them in temporary file
    vidIndex=0
    echo "" > $optionsList
    while IFS= read -r line
    do
        EVAL=`echo " \"$line\" "`
        if [[ $EVAL == *"mp4"* || $EVAL == *"avi"* || $EVAL == *"webm"* ]]; then
        ((vidIndex++))
            if [[ $vidIndex == 1 ]]; then 
                FIRSTVID=$line 
            fi
        echo "        <option>$line</option>" >> $optionsList
        fi
    done < "$input"
# END: enclose list of vid files in select tag and place them in temporary file


if [[ $selectedStyle == "h" ]]; then
    output="x_horiz.html"
    cssType="horizstyle.css"
    if [ $vidIndex .ge 16 ]; then
        listSize="16"
    else
        listSize=$vidIndex;
    fi
fi

if [[ $selectedStyle == "v" ]]; then
    output="x_vert.html"
    cssType="vertstyle.css"
    listSize="3"
fi

if [[ $selectedStyle == "d" ]]; then
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

echo "    <div id=\"pickerDiv\" class=\"selector\">" >> $output
echo "    <select id=\"filePicker\" onchange=\"switchVid(this.id,directory.id)\" size=$listSize>  <!--Call run() function-->" >> $output

cat $optionsList >> $output

echo "    </select>" >> $output
echo "    </div>" >> $output

#immediately show first video clip in dropdown style
if [[ $selectedStyle == "d" ]]; then
    echo "    <video src=\"./$FIRSTVID\" id=\"vidPicked\" onmouseover=\"initVidPlayer(this.id)\"></video>" >> $output
else
    echo "    <video src=\"$SOURCEDIR/img/init.mp4\" id=\"vidPicked\" onmouseover=\"initVidPlayer(this.id)\"></video>" >> $output
fi

echo "    <div id=\"directory\" style=\"display:none\">./</div>" >> $output

echo "</body> " >> $output
echo "    <script src=\"$SOURCEDIR/functions.js\"></script> " >> $output
echo "</html> " >> $output

#rm /tmp/list.txt
