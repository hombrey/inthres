#!/bin/bash

# extract the source directory from the command used to call this script
SOURCEDIR=`echo "${0%/*}"`
SOURCEDIR=`echo "${0%/*}"`
SOURCEROOT=`echo "${0%/*/*}"`
LESSONDIR=`pwd`

echo "<!DOCTYPE html>" > 0_void.html
echo "<html lang=\"en\">" >> 0_void.html
echo "<head>" >> 0_void.html
echo "    <script src=\"$SOURCEDIR/functions.js\"></script> " >> 0_void.html
echo "    <link rel=\"stylesheet\" href=\"$SOURCEDIR/styles.css\">" >> 0_void.html
echo "</head>" >> 0_void.html
echo "<body>" >> 0_void.html
echo "    <select class=\"selectBox\" id=\"dummy\"><option>empty</option></select>" >> 0_void.html
echo "</body>" >> 0_void.html
echo "</html>" >> 0_void.html
