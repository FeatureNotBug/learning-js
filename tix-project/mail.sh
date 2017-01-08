#!/bin/sh

if [ $# != 2 ]
then
	echo "Usage: $0 <filename> <addressee>"
	exit
fi

# Sends filename as attachment; local
# echo "Automated message"|mutt -s "Message from $0" -a $1 -- $2

# Sends filaname as content; local
# cat $1 | mail -s "Message from $0" $2

# Sends filename as content; Internet
cat $1 | ssmtp $2

