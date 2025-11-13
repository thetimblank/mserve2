import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { createSpinner } from 'nanospinner';
import Backup from './backup.ts';
import { intervalBackup } from '../lib/interval.ts';
import { askDirectory } from '../utils.ts';

const checkForDirectory = (directory: string) => {
	if (fs.existsSync(directory)) {
		return true;
	}

	console.log(chalk.red('The directory specified does not have a server.'));
	return false;
};

const getStorage = (directory: string): MserveJson | null => {
	let data: string;
	try {
		data = fs.readFileSync(path.resolve(path.join(directory, 'mserve.json')), 'utf8');
	} catch (err: any) {
		console.error(
			chalk.red(
				'\nThere is no mserve.json in this location. You can auto generate the default mserve.json using `mserve init`'
			)
		);
		return null;
	}

	if (!data) {
		console.error(chalk.red('\nThere is no data in this location. (check mserve.json)'));
		return null;
	}

	try {
		return JSON.parse(data) as MserveJson;
	} catch (err: any) {
		console.error(chalk.red('\nInvalid mserve.json - unable to parse JSON.'));
		return null;
	}
};

const start = async (directory: string) => {
	if (!checkForDirectory(directory)) {
		return;
	}

	const storage = getStorage(directory);

	if (!storage) {
		console.error(chalk.red('\nmserve.json is not present .'));
		return;
	}

	const lines: string[] = [`${chalk.bgHex('#643bd7').bold('MSERVE')}`, chalk.bold(`Serving ${directory}!`)];

	if (storage.ram !== undefined && storage.ram !== null) {
		lines.push(`${chalk.green('➜')} Memory: ${chalk.blueBright(`${storage.ram}GB`)}`);
	}

	if (storage.version) {
		lines.push(`${chalk.green('➜')} Version: ${chalk.blueBright(storage.version)}`);
	}

	if (storage.provider) {
		lines.push(`${chalk.green('➜')} Provider: ${chalk.blueBright(storage.provider)}`);
	}

	if (storage.auto_backup !== undefined && storage.auto_backup !== null) {
		lines.push(`${chalk.green('➜')} Auto Backup: ${chalk.blueBright(storage.auto_backup ? 'On' : 'Off')}`);
	}

	if (storage.auto_restart !== undefined && storage.auto_restart !== null) {
		lines.push(
			`${chalk.green('➜')} Auto Restart: ${chalk.blueBright(storage.auto_restart ? 'On' : 'Off')}`
		);
	}

	if (Array.isArray(storage.custom_flags) && storage.custom_flags.length > 0) {
		lines.push(`${chalk.green('➜')} Custom Flags: ${chalk.blueBright(storage.custom_flags.join(' '))}`);
	}

	console.log(lines.join('\n'));

	const spinner = createSpinner(`${chalk.gray(`Starting...`)}`).start();
	const startTime = Date.now();

	if (storage.auto_backup && storage.auto_backup.includes('on_start')) {
		Backup([directory]);
	}

	const autobackup = intervalBackup(directory, storage);

	const runner = spawn(
		`java`,
		[
			`-Xms${storage.ram ?? 3}G`,
			`-Xmx${storage.ram ?? 3}G`,
			'-jar',
			`${storage.file ?? 'server.jar'}`,
			...(storage.custom_flags ?? []),
		],
		{
			cwd: directory,
			shell: true,
			stdio: 'inherit',
		}
	);

	spinner.success({ text: `${chalk.green('Loaded!')}` });

	runner.on('close', () => {
		if (autobackup) {
			clearInterval(autobackup);
		}

		if (storage.auto_backup && storage.auto_backup.includes('on_close')) {
			Backup([directory]);
		}

		const elapsed = Date.now() - startTime;

		const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

		console.log(
			chalk.green(
				`\nServer had a clean exit! ${chalk.gray('Elapsed for')} ${chalk.blueBright(
					`${hours}h ${minutes}m ${seconds}s`
				)}`
			)
		);
	});
};

const Serve = async (args: Args) => {
	if (!args) {
		const route = await askDirectory();

		start(route);

		return;
	}

	start(path.resolve(args[0]));

	return;
};

export default Serve;
