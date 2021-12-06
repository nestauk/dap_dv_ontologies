#!/bin/bash

node src/bin/all/concatenateQueries.mjs \
    -i graphs/performance graphs/quality -o src/benchmarking \
&& cd src/benchmarking && java -jar iguana-3.3.0.jar config.yml 
