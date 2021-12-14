#!/bin/bash

if [[ ! -f src/benchmarking/iguana-3.3.0.jar ]]; then 

    npm run getIguanaJarZip
    unzip src/benchmarking/iguana-3.3.0.zip -d src/benchmarking
    mv src/benchmarking/iguana/iguana-3.3.0.jar src/benchmarking
    rm -rf src/benchmarking/iguana
    rm src/benchmarking/iguana-3.3.0.zip
    
fi