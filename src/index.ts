'use strict';

import chalk from 'chalk';
import { argv } from 'node:process';
import Init from './commands/init.ts';
import Help from './commands/help.ts';
import Docs from './commands/docs.ts';
import Serve from './commands/serve.ts';
import Delete from './commands/delete.ts';
import Backup from './commands/backup.ts';

const main = () => {
	const arg = argv[2];
	const args: Args = argv.length > 3 ? argv.slice(3) : undefined;

	const helpMessage = `
   ${chalk.bgHex('#643bd7').bold('MSERVE')} 
   ${chalk.green('➜')} See 'mserve help' for a list of commands.
   ${chalk.green('➜')} You can view the docs at 'mserve docs'.
   `;

	if (!arg) {
		console.log(helpMessage);

		return;
	}

	switch (arg) {
		case 'help':
			Help(args);
			break;
		case 'init':
			Init(args);
			break;
		case 'docs':
			Docs(args);
			break;
		case 'serve':
			Serve(args);
			break;
		case 'backup':
			Backup(args);
			break;
		case 'delete':
			Delete(args);
			break;
		default:
			console.log(helpMessage);
	}
};

main();
