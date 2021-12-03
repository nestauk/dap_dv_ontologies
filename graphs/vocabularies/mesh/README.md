# MeSH Ontology

Technical documentation can be found at https://hhs.github.io/meshrdf/.
Graph IRI: `http://id.nlm.nih.gov/mesh`

The SPARQL queries found at [graphs/performance/mesh](../../quality/mesh) are
taken from the [MeSH Documentation](https://hhs.github.io/meshrdf/sample-queries)
and the queries in this repo are numbered the same as the examples given there.

cURL command for `neptune`:

```
curl -X POST -H 'Content-Type: application/json' \
https://geonames-rdf-01.cluster-ci9272ypsbyf.eu-west-2.neptune.amazonaws.com:8182/loader -d '
    {
      "source" : "s3://nesta-graph-data/mesh.nt",
      "format" : "ntriples",
      "iamRoleArn" : "arn:aws:iam::195787726158:role/NeptuneLoadFromS3",
      "region" : "eu-west-2",
      "failOnError" : "FALSE",
      "parallelism" : "MEDIUM",
      "updateSingleCardinalityProperties" : "FALSE",
      "parserConfiguration" : {
          "namedGraphUri": "http://id.nlm.nih.gov/mesh"
      }
    }'
```
