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

program.requiredOption(
	'-p, --path <path>',
	'Path to directory benchmark results'
);

program.parse(process.argv);
const options = program.opts();

const main = async () => {
	const oldPath = await mostRecentBenchmarkFilePath(options.path);
	const newPath = oldPath.replace('results_', '');

	const fileName = path.basename(newPath);
	const graphBase = 'http://nesta.org.uk/benchmarking/results';
	const graphName = `${graphBase}/${fileName.replace('.nt', '')}`;

	await fs.rename(oldPath, newPath);

	const uploadCommand = `scp ${newPath} ubuntu@${address}:${EC2ResultsDir}`;
	const sqlCommand = `ld_dir (\\'${EC2ResultsDir}\\', \\'${fileName}\\', \\'${graphName}\\');\nrdf_loader_run();`;
	const bashCommand = `ssh ubuntu@${address} "echo $'${sqlCommand}' | isql"`;

	execSync(uploadCommand);
	execSync(bashCommand);

	await fs.copyFile(newPath, `${options.path}/results/${fileName}`);
	await fs.rm(newPath);
};

main();
