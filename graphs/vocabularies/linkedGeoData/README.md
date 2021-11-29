# Open Street Map ontology

Technical documentation can be found at http://linkedgeodata.org/

Graph IRI: `http://linkedgeodata.org`

## Data source

We've agreed to use their [releases](https://hobbitdata.informatik.uni-leipzig.de/LinkedGeoData/downloads.linkedgeodata.org/releases/2015-11-02/) for now, as the LinkedGeoData software is old and would 
likely take some time to get running.

There's a short [script](../../src/bin/OSM/download_latest_lgd_releases.sh) that 
will download these files automatically before unzipping and ingesting.

## SPARQL Queries

The example queres found in [graphs/performance/osm](../../performance/osm) are
taken from the LinkedGeoData site [here](http://linkedgeodata.org/docs/examples/osm-queries.html)

For the time being `example_07.rq`, "Find all schools within a 5km radius around
a specific location, and for each school find coffeeshops that are closer than 
1km.", is omitted as it is causing a bug.

### Empty Result Sets

- `example_01.rq`
- `example_03.rq`
- `example_04.rq`
- `example_05.rq`

#### Possible reasons for empty result sets:

- We're using a subset of the OSM data.
- Some quirks with virtuoso and Geo data - known bugs with `RDF box`.

### SPARQL errors

- `example_07.rq`

#### Possible reasons for errors

`Virtuoso 22003 Error SR586: Incomplete RDF box as 
argument 0 for st_intersects().`

## Notes

Using a subset of files for now:

```
 13G 2015-11-02-Amenity.node.sorted.nt
 21G 2015-11-02-Amenity.way.sorted.nt
 67M 2015-11-02-Boundary.node.sorted.nt
 30G 2015-11-02-Boundary.way.sorted.nt
2.1G 2015-11-02-ManMadeThing.node.sorted.nt
5.4G 2015-11-02-ManMadeThing.way.sorted.nt
8.4G 2015-11-02-Place.node.sorted.nt
6.6G 2015-11-02-Place.way.sorted.nt
3.2G 2015-11-02-Shop.node.sorted.nt
2.1G 2015-11-02-Shop.way.sorted.nt
```

Total: `91G`

## cURL

cURL command for `neptune`:

```
curl -X POST -H 'Content-Type: application/json' \
https://geonames-rdf-01.cluster-ci9272ypsbyf.eu-west-2.neptune.amazonaws.com:8182/loader -d '
    {
      "source" : "s3://nesta-graph-data/OSM",
      "format" : "ntriples",
      "iamRoleArn" : "arn:aws:iam::195787726158:role/NeptuneLoadFromS3",
      "region" : "eu-west-2",
      "failOnError" : "FALSE",
      "parallelism" : "MEDIUM",
      "updateSingleCardinalityProperties" : "FALSE",
      "parserConfiguration" : {
          "namedGraphUri": "http://linkedgeodata.org"
      }
    }'
```
