#!/bin/bash

queryDirs=("performance" "quality")

for dir in ${queryDirs[@]}
do
    for ontology in `ls ./graphs/$dir`
    do
        currDir="./graphs/$dir/$ontology"
        echo "Fetching query results for $currDir"
        node ./src/bin/all/fetchQueryResults.mjs -f -p $currDir
    done
done    