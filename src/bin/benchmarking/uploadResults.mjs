#!/usr/bin/env node
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';

import { mostRecentBenchmarkFilePath } from 'queries/util.mjs';
import { EC2, EC2ResultsDir } from '../../node_modules/config.mjs';

(async () => {
	// remove http:// from string
	const address = EC2.slice(7);
	const oldPath = await mostRecentBenchmarkFilePath('.');
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

	await fs.copyFile(newPath, `./results/${fileName}`);
	await fs.rm(newPath);
})();
