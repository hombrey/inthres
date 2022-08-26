#!/bin/bash

# extract the source directory from the command used to call this script
SOURCEDIR=`echo "${0%/*}"`
#truncate last character (i.e. "/")


echo "<!DOCTYPE html>" > x_StepSee.html
echo "<html lang=\"en\">" >> x_StepSee.html
echo "<head>" >> x_StepSee.html
echo "    <meta charset=\"UTF-8\">" >> x_StepSee.html
echo "    <title></title> " >> x_StepSee.html
echo "    <meta name=\"description\" content\"\">" >> x_StepSee.html
echo "    <meta name=\"author\" content=\"Hombrey\">" >> x_StepSee.html
echo "    <link rel=\"stylesheet\" href=\"$SOURCEDIR/styles.css\">" >> x_StepSee.html
echo "</head>" >> x_StepSee.html
echo "" >> x_StepSee.html
echo "<body id=\"myBody\">" >> x_StepSee.html
echo "    <div id=\"srcdir\" style=\"display:none;\">$SOURCEDIR/</div>" >> x_StepSee.html
echo "    <div id=\"assetdir\" style=\"display:none\">./</div>" >> x_StepSee.html
echo "" >> x_StepSee.html
echo "    <img class=\"fullPage\" id=\"backgroundX\" src=\"$SOURCEDIR/img/BG0.png\">" >> x_StepSee.html
echo "    <img class=\"dieClass\" id=\"die1\" onClick=\"toggleDieSpin()\" src=\"../srcHTML/StepAndSee/img/die0.webp\">" >> x_StepSee.html
echo "    <select class=\"selectBox\" id=\"dummy\"><option id=\"optionText\">StepAndSee</option></select>" >> x_StepSee.html
echo "    <script src=\"$SOURCEDIR/functions.js\"></script> " >> x_StepSee.html

ls $SOURCEDIR/tails | sort -n > /tmp/list.txt
filelist="/tmp/list.txt"

echo $SOURCEDIR
tailindex=1;
tails=("")
while IFS= read -r line
do
    EVAL=`echo " \"$line\" "`
    if [[ $EVAL == *"html"* ]]; then
          echo "        $tailindex $line" 
          tails+=("$line")
          ((tailindex++))
    fi
done < "$filelist"

read -p "select Tail: " selectedTail

#TAILTYPE=`echo $1`
TAILTYPE=`echo $SOURCEDIR/tails/${tails[selectedTail]}`
cat "$TAILTYPE" >> x_StepSee.html
rm $filelist
