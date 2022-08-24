#!/bin/bash
ls |sort -n > /tmp/rawlist.txt

read -p "shuffle? (y/n) " isShuffled

if [[ $isShuffled == "y" ]]; then
        #mix up the order of the files
        shuf /tmp/rawlist.txt > /tmp/list.txt
else
        cp /tmp/rawlist.txt /tmp/list.txt
fi

input="/tmp/list.txt"

# extract the source directory from the command used to call this script
SOURCEDIR=`echo "${0%/*}"`

echo "<html lang=\"en\">" > x_choose.html
echo "<head>" >> x_choose.html
echo "    <meta charset=\"UTF-8\">" >> x_choose.html
echo "    <title></title> " >> x_choose.html
echo "    <meta name=\"author\" content=\"Hombrey\">" >> x_choose.html
echo "    <link rel=\"stylesheet\" href=\"$SOURCEDIR/styles.css\">" >> x_choose.html
echo "</head>" >> x_choose.html
echo "" >> x_choose.html
echo "<body id=\"myBody\">" >> x_choose.html
echo "    <img class=\"fullPage\" id=\"backgroundX\" src=\"$SOURCEDIR/img/BG0.png\">" >> x_choose.html
echo "    <div id=\"srcDir\" style=\"display:none\">$SOURCEDIR/</div>" >> x_choose.html
echo "    <div id=\"assetDir\" style=\"display:none\">./</div>" >> x_choose.html
echo "    <select class=\"selectBox\" id=\"dummy\"><option>PicAndChoose</option></select>" >> x_choose.html
echo "    <div class =\"grid3\" >" >> x_choose.html
echo "        <div class =\"grid3-left\" > </div>" >> x_choose.html
echo "        <div class =\"grid3-right\" > </div>" >> x_choose.html
echo "        <img class =\"grid3-center\" id=\"mainImg\" src=\"$SOURCEDIR/img/init.png\" >" >> x_choose.html
echo "    </div>" >> x_choose.html
echo "    <img class=\"choices\" id=\"choice1\" onClick=\"evalClick(this.id)\" " >> x_choose.html
echo "         src=\"./choices/1.png\">" >> x_choose.html
echo "    <img class=\"choices\" id=\"choice2\" onClick=\"evalClick(this.id)\" " >> x_choose.html
echo "         src=\"./choices/2.png\">" >> x_choose.html
echo "    <img class=\"choices\" id=\"choice3\" onClick=\"evalClick(this.id)\" " >> x_choose.html
echo "         src=\"./choices/3.png\">" >> x_choose.html
echo "    <img class=\"choices\" id=\"choice4\" onClick=\"evalClick(this.id)\" " >> x_choose.html
echo "         src=\"./choices/4.png\">" >> x_choose.html
echo "" >> x_choose.html
echo "    <span class=\"guide\" id=\"guide1\">1</span>" >> x_choose.html
echo "    <span class=\"guide\" id=\"guide2\">2</span>" >> x_choose.html
echo "    <span class=\"guide\" id=\"guide3\">3</span>" >> x_choose.html
echo "    <span class=\"guide\" id=\"guide4\">4</span>" >> x_choose.html
echo "" >> x_choose.html
echo "    <script src=\"$SOURCEDIR/functions.js\"></script> " >> x_choose.html
echo "    <script> " >> x_choose.html
echo "      promptSet = [" >> x_choose.html 
while IFS= read -r line
do
    EVAL=`echo " \"$line\" "`
    if [[ $EVAL == *"jpg"* || $EVAL == *"png"* || $EVAL == *"gif"* ]]; then
        if [[ $isShuffled == "y" ]]; then
                # insert each name of the file and plug in the first character of file as default choice
                echo "        new PromptString(\"$line\",${line:0:1})," >> x_choose.html
        else
                # if unshuffled, use "1" as the default choice
                echo "        new PromptString(\"$line\",1)," >> x_choose.html
        fi

    fi
done < "$input"

echo "      new PromptString(\"\",0)];" >> x_choose.html
echo "    </script> " >> x_choose.html
echo "</body> " >> x_choose.html
echo "</html> " >> x_choose.html

rm /tmp/list.txt
rm /tmp/rawlist.txt
cp -nr $SOURCEDIR/choices . # n option should prevent from overwriting
