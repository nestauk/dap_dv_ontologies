import { querySparql } from 'queries/fetchQuery.mjs';
import { program } from 'commander'
import { promises as fs, constants } from 'fs'
import * as path from 'path'

program
.option('-f, --force', 'Force write over existing results')
.requiredOption('-p, --path <path>', 'Path to directory containing SPARQL queries')

program.parse(process.argv);
const options = program.opts();

const zip2 = (a1, a2) => a1.map((x, i) => [x, a2[i]]);

(async () => {
	try {
		// eslint-disable-next-line no-bitwise
		await fs.access(options.path, constants.R_OK | constants.W_OK);
	} catch (error) {
		throw new Error(`Cannot write to ${options.path}`)
	}

	const files = await fs.readdir(options.path);
	const queryFiles = files.filter(file =>
		file.endsWith('.rq')
		&& (options.force || !(file.replace('.rq', 'csv') in files))
	)

	const queries = await Promise.all(queryFiles.map(file => {
		return fs.readFile(path.join(options.path, file), { encoding: 'utf-8'});
	}));

	const results = await Promise.all(queries.map(query => {
		return querySparql('virtuoso', query, { format: 'text/csv' })
	}));

	await Promise.all(zip2(queryFiles, results).map(([file, result],) => {
		const outPath = path.join(options.path, file.replace('.rq', '.csv'));
		return fs.writeFile(outPath, result);
	}));
})();
