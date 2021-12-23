import { promises as fs } from 'fs';
import * as path from 'path';

import { program } from 'commander';

import { sparqlEndpoints } from '../../node_modules/config.mjs';
import { querySparql } from 'queries/fetch.mjs';

program.option(
	'-o, --output-path <outputPath>',
	'Path for output queries.txt file'
);

program.parse(process.argv);
const options = program.opts();

const outputDirPath = options.outputPath || '.';

const getGraphNameQuery = `SELECT DISTINCT ?g
WHERE {
    GRAPH ?g { ?s ?p ?o . }
}`;

const main = async () => {
	const response = await querySparql('neptune', getGraphNameQuery, {
		format: 'json',
		quiet: true,
	});
	const graphNameResults = JSON.parse(response.result);
	const graphNames = unwrapResults(graphNameResults, 'g');
	const tripleCountQueries = graphNames.map(graph => ({
		name: graph,
		query: `SELECT (COUNT(?s) as ?count) FROM <${graph}> WHERE { ?s ?p ?o . } LIMIT 10`,
	}));
	const endpointQueries = Object.entries(sparqlEndpoints).map(
		([name, endpoint]) => ({
			name,
			endpoint,
			queries: tripleCountQueries,
		})
	);
	const results = await Promise.all(endpointQueries.map(countTriples));
	await fs.writeFile(
		path.join(outputDirPath, 'counts.json'),
		JSON.stringify(results, null, 4)
	);
};

const unwrapResults = (results, key) =>
	results.results.bindings.map(binding => binding[key].value);

const countTriples = async endpointObject => {
	const countResponses = await Promise.all(
		endpointObject.queries.map(queryObject => {
			return querySparql(endpointObject.endpoint, queryObject.query, {
				format: 'json',
				message: `Counted ${queryObject.name} at ${endpointObject.name}`,
			});
		})
	);

	const counts = countResponses.map((res, i) => {
		let count;
		try {
			count = parseInt(unwrapResults(JSON.parse(res.result), 'count')[0]);
		} catch {
			count = 'Error';
		}
		return { name: endpointObject.queries[i].name, count };
	});
	return { name: endpointObject.name, counts };
};

main();
