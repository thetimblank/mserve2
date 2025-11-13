import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { askDirectory } from '../utils.ts';

const getWorlds = (directory: string) => {
	const data = fs
		.readdirSync(directory, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => e.name);

	if (!data) {
		console.log(chalk.red('\nThere is no server in this location or there was an error finding it.'));
		return null;
	}

	const worlds: string[] = [];

	data.forEach((e) => {
		if (fs.readdirSync(path.join(directory, e)).includes('level.dat')) {
			worlds.push(e);
		}
	});

	if (worlds.length <= 0) {
		console.log(chalk.red('\nThere are no worlds in this server. (Make sure theres a `level.dat`!)'));
		return null;
	}

	return worlds;
};

const checkStorage = (directory: string) => {
	try {
		if (!fs.readdirSync(directory).includes('.backups')) {
			fs.mkdirSync(path.join(directory, '.backups'), { recursive: true });
		}
		return true;
	} catch (err: unknown) {
		console.error(err);
		return false;
	}
};

const backupWorlds = (directory: string) => {
	const worlds = getWorlds(directory);

	if (!worlds) {
		return;
	}

	if (!checkStorage(directory)) {
		return;
	}

	const spinner = createSpinner(`${chalk.gray(`Backing-up worlds...`)}`).start();

	const timestamp = new Date().toLocaleString().replace(/\//g, '-').replace(/:/g, '.');
	const location = path.resolve(path.join(directory, '.backups', timestamp));

	try {
		fs.mkdirSync(location, { recursive: true });
	} catch (err: unknown) {
		console.error(err);
		return;
	}

	worlds.forEach((e) => {
		const route = path.join(location, e);

		try {
			fs.mkdirSync(route, { recursive: true });
		} catch (err: unknown) {
			console.error(err);
			return;
		}

		fs.cpSync(path.join(directory, e), route, {
			recursive: true,
			filter: (file) => !file.includes('session.lock'),
		});
	});

	spinner.success({ text: `${chalk.green('Backed-up worlds!')}` });

	spinner.success({ text: `${chalk.green('Backed-up worlds!')}` });
};

const Backup = async (args: Args) => {
	if (!args) {
		const route = await askDirectory();
		backupWorlds(route);

		return;
	}

	backupWorlds(path.resolve(args[0]));

	return;
};

export default Backup;
