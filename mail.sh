#!/bin/sh

if [ $# != 2 ]
then
	echo "Usage: $0 <filename> <addressee>"
	exit
fi

echo "Automated message"|mutt -a $1 -- $2

