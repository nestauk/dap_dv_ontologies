# Benchmarking

We are using the Iguana for the time being to benchmark/stress test our
databases. The jar file can be run by first navigating to the benchmarking
directory and then invoking the `java -jar` command:

```
cd src/benchmarking
java -jar iguana
java -jar iguana-3.3.0.jar config.yml
```

However it's better to use the `npm run` command as it will execute the
pre-hook scripts which auto-populate the queries.txt file, which ensures the
latest query files are being used for the benchmark.

`npm run benchmarkAllSparqlQueries`

## Neptune

To run this locally, you must first setup an SSH tunnel for the `8182` port.
First edit your `/etc/hosts` and add the following line to the bottom:

`127.0.0.1 localhost geonames-rdf-01.cluster-ro-ci9272ypsbyf.eu-west-2.neptune.amazonaws.com`

Then run the following command (assuming you have set up SSH connection before):

`ssh ubuntu@ec2-18-170-45-162.eu-west-2.compute.amazonaws.com -N -L 8182:geonames-rdf-01.cluster-ro-ci9272ypsbyf.eu-west-2.neptune.amazonaws.com:8182`

So long as the SSH connection is alive, you can now query the Neptune endpoint.
For example, to poll the status endpoint, use the following URL:

`https://geonames-rdf-01.cluster-ro-ci9272ypsbyf.eu-west-2.neptune.amazonaws.com:8182/status`

and run Iguana.

## Notes

The `postinstall` script will only download the `.zip` of the relevant iguana
binaries. Users must unzip these files manually for the time being before
being able to run `npm run benchmarkAllSparqlQueries`.
