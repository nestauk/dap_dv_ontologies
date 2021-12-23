#!/usr/bin/env node
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';

import { program } from 'commander';

import { mostRecentBenchmarkFilePath } from 'queries/util.mjs';
import {
	EC2Domain as address,
	EC2ResultsDir,
} from '../../node_modules/config.mjs';

program.option(
	'-f --file <file>',
	'Result file to upload. If this option is not \
		specified, the latest file will be uploaded'
);
program.option(
	'-g --graph-name <graphName>',
	'Optional name of graph to be used for results. \
		The results IRI prefix of <http://nesta.org.uk/benchmarking/> \
		will always get prepended to this option'
);
program.requiredOption(
	'-p, --path <path>',
	'Path to directory benchmark results'
);

program.parse(process.argv);
const options = program.opts();

const main = async () => {
	const oldFilePath = options.file
		? path.join(options.path, options.file)
		: await mostRecentBenchmarkFilePath(options.path);
	const newFilePath = oldFilePath.replace('results_', '');

	const fileName = path.basename(newFilePath);
	const graphBase = 'http://nesta.org.uk/benchmarking/results';
	const graphName = options.graphName
		? `${graphBase}/${options.graphName}`
		: `${graphBase}/${fileName.replace('.nt', '')}`;

	// await fs.rename(oldFilePath, newFilePath);

	const uploadCommand = `scp ${newFilePath} ubuntu@${address}:${EC2ResultsDir}`;
	const sqlCommand = `ld_dir (\\'${EC2ResultsDir}\\', \\'${fileName}\\', \\'${graphName}\\');\nrdf_loader_run();`;
	const bashCommand = `ssh ubuntu@${address} "echo $'${sqlCommand}' | isql"`;

	console.log(uploadCommand);
	console.log(bashCommand);
	// execSync(uploadCommand);
	// execSync(bashCommand);

	// await fs.copyFile(newFilePath, `${options.path}/results/${fileName}`);
	// await fs.rm(newFilePath);
};

main();
