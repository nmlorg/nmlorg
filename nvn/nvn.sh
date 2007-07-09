#!/bin/bash

# nvn
# Some wrappers to make Subversion a little more Perforce-ish.
#
# Joshua Wise, 2007

# sanity
if [ -z "$EDITOR" ]; then
	echo 'nvn: no $EDITOR; defaulting to joe'
	EDITOR=joe
fi

# functions that we might like
function getenvironment() {
	# Walk up until we find a .nvn directory
	_THEDIR=$(pwd)
	while [ ! -d "$_THEDIR/.nvn" -a "$_THEDIR" != / ]; do
		_THEDIR=$(dirname "$_THEDIR")
	done
	if [ "$_THEDIR" == / ]; then
		CLIENTDIR=
	else
		CLIENTDIR="$_THEDIR"
	fi
}

function requireclient() {
	getenvironment
	{ [ ! -z "$CLIENTDIR" ] && . "$CLIENTDIR"/.nvn/clientspec } || { echo "nvn: This applet requires a client. Use \`nvn client' to create one."; exit 1 ; }
}

# the big whack
case "$1" in
client)
	getenvironment
	if [ -z "$CLIENTDIR" ]; then
		echo "nvn: creating a nvn client in the current directory"
		cat > /tmp/nvnclient.$$ <<EOF
# This is a client spec.
# It has the same syntax as a bash script.

CLIENTNAME=$(whoami)-$$
SVNROOT="$(svn info | grep "Repository Root" | cut -d: -f2- | cut -b2-)"
EOF
		$EDITOR /tmp/nvnclient.$$ || { echo "nvn: Client edit failed. Leaving your client spec in /tmp/nvnclient.$$; sorry."; exit 1 ; }
		. /tmp/nvnclient.$$ || { echo "nvn: Client spec source failed. Leaving your client spec in /tmp/nvnclient.$$. Hope you get it worked out, sorry."; exit 1 ; }
		if [ -z "$CLIENTNAME" ]; then
			echo "nvn: you needed to fill in a CLIENTNAME. Sometimes I like to blame myself for bad parsing issues, but this one's all on you. Obviously you suck."
			exit 1
		fi
		svn mkdir "$SVNROOT"/clients/"$CLIENTNAME" \
			"$SVNROOT"/clients/"$CLIENTNAME"/changelists \
			-m "nvn: Created client $CLIENTNAME" || { echo "nvn: Client create failed; see svn output for further diagnostics. Leaving your client spec in /tmp/nvnclient.$$."; exit 1 ; }
		svn co "$SVNROOT"/clients/"$CLIENTNAME" .nvn || exit 1
		mv /tmp/nvnclient.$$ .nvn/clientspec || exit 1
		cd .nvn || exit 1
		svn add clientspec || exit 1
		svn commit -m "nvn: Created client $CLIENTNAME" || exit 1
		chmod -w .nvn/clientspec || exit 1
		exit 0
	fi
	. "$CLIENTDIR"/.nvn/clientspec || exit 1
	$EDITOR "$CLIENTDIR"/.nvn/clientspec
	;;
change)
	requireclient
	shift
	while [ $# -ne 0 ]; do
		case "$1" in
		-h|--help)
			echo "nvn change: usage: nvn change [-h|--help] [-c|--changelist changelistnumber] [files]"
			exit 1
			;;
		-c|--changelist)
			if [ -z "$2" ]; then
				echo "nvn change: need a parameter for -c, sorry"
				exit 1
			fi
			CL="$2"
			;;
		*)
			FILES="$2 $FILES"
			;;
		esac
	done
		
	if [ -z "$CL" ]; then
		newcl	# defines CL for us
	fi
	;;
*)
	echo "nvn: unknown command $1, passing to svn"
	svn "$@"
	;;
esac