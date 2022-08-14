#!/bin/bash

# extract the source directory from the command used to call this script
SOURCEDIR=`echo "${0%/*}"`
#truncate last character (i.e. "/")


echo "<!DOCTYPE html>" > x_Pick.html
echo "<html lang=\"en\">" >> x_Pick.html
echo "<head>" >> x_Pick.html
echo "    <meta charset=\"UTF-8\">" >> x_Pick.html
echo "    <title></title> " >> x_Pick.html
echo "    <meta name=\"description\" content\"\">" >> x_Pick.html
echo "    <meta name=\"author\" content=\"Hombrey\">" >> x_Pick.html
echo "    <link rel=\"stylesheet\" href=\"$SOURCEDIR/styles.css\">" >> x_Pick.html
echo "</head>" >> x_Pick.html
echo "" >> x_Pick.html
echo "<body id=\"myBody\">" >> x_Pick.html
echo "    <div id=\"srcdir\" style=\"display:none;\">$SOURCEDIR/</div>" >> x_Pick.html
echo "    <div id=\"assetdir\" style=\"display:none\">./</div>" >> x_Pick.html
echo "" >> x_Pick.html
echo "    <img class=\"fullPage\" id=\"backgroundX\" src=\"$SOURCEDIR/img/BG0.png\">" >> x_Pick.html
echo "    <select class=\"selectBox\" id=\"dummy\"><option>PickAndPlace</option></select>" >> x_Pick.html
echo "    <script src=\"$SOURCEDIR/functions.js\"></script> " >> x_Pick.html

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
cat "$TAILTYPE" >> x_Pick.html
rm $filelist
