var express = require("express");
const fetch = require("node-fetch");
var router = express.Router();

const endpoint =
  "https://geonames-rdf-01.cluster-ro-ci9272ypsbyf.eu-west-2.neptune.amazonaws.com:8182/sparql";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Neptune Sparql Query Editor" });
});

router.get("/sparql", async function (req, res) {
  const query = encodeURIComponent(req.query.query);
  const response = await fetch(endpoint, {
    body: `query=${query}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  if (response.ok) {
    res.json(await response.json());
  } else {
    res.json(response);
  }
});

module.exports = router;
