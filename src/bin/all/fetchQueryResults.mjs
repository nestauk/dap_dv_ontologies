import { promises as fs } from 'fs';
import * as path from 'path';

import { program } from 'commander';

import { readQueryFiles } from 'queries/query'
import { querySparql } from 'queries/fetch';

program
.option('-f, --force', 'Force write over existing results')
.requiredOption(
	'-p, --path <path>',
	'Path to directory containing SPARQL queries'
);

program.parse(process.argv);
const options = program.opts();

const zip2 = (a1, a2) => a1.map((x, i) => [x, a2[i]]);

(async () => {
	try {
		await fs.access(options.path);
	} catch (error) {
		throw new Error(`Cannot write to ${options.path}`);
	}

	const files = await fs.readdir(options.path);
	const queryFiles = files.filter(
		file =>
			file.endsWith('.rq') &&
			(options.force || !(file.replace('.rq', 'csv') in files))
	);

	const queries = await readQueryFiles(queryFiles);

	const results = await Promise.all(
		zip2(queries, queryFiles).map(([query, file]) => {
			let filePath = path.join(options.path, file);
			return querySparql('virtuoso', query, {
				file: filePath,
				format: 'text/csv',
			});
		})
	);

	await Promise.all(
		zip2(queryFiles, results).map(([file, result]) => {
			const outPath = path.join(
				options.path,
				file.replace('.rq', '.csv')
			);
			return fs.writeFile(outPath, result ? result : '');
		})
	);
})();
