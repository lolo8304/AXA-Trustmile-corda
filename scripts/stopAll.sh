#!/bin/bash
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
. $BASEDIR/env.sh

cd $BASEDIR
$BASEDIR/stopServers.sh
$BASEDIR/stopNodes.sh

echo "---------------------------------"
echo "CORDA and Webservers are DOWN now"
echo "---------------------------------"
$BASEDIR/status.sh
