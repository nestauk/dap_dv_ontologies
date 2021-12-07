import { promises as fs } from 'fs';
import * as path from 'path';

import { program } from 'commander';
import pkg from 'glob';
const { glob } = pkg;

import { readQueryFiles, concatenateQueries } from 'queries/query.mjs';

program
.requiredOption(
	'-i, --input-paths <inputPaths...>',
	'Paths for SPARQL query files to be concatenated'
)
.requiredOption(
	'-o, --output-path <outputPath>',
	'Path for output queries.txt file'
);

program.parse(process.argv);
const options = program.opts();

for (const queryPath of [...options.inputPaths, options.outputPath]) {
	if (!fs.access(queryPath)) {
		throw new Error(`${queryPath} not a valid directory`);
	}
}

(async () => {
	const getQueryFiles = dir => glob.sync(`${dir}/**/*.rq`);
	const files = options.inputPaths.map(getQueryFiles).flat();
	const queries = await readQueryFiles(files);
	const concatenatedQueries = concatenateQueries(queries);

	await fs.writeFile(
		path.join(options.outputPath, 'queries.txt'),
		concatenatedQueries
	);
})();
