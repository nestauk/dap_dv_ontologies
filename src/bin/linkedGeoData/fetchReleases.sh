#!/bin/bash

if [ $# -ne 1 ] || [ ! -d $1 ]; then
    echo "You must supply a valid path to the output directory"
    exit
fi

script_dir="${0%/*}"
node $script_dir/fetchURLS.js | xargs wget -P $1