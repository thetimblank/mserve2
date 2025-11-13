import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { askDirectory } from '../utils.ts';

const confirmation = async () => {
	const result = await confirm({
		message: 'Are you sure you want to permanently delete this server (worlds, settings, etc.)?',
	});

	return result;
};

const deleteServer = (directory: string) => {
	try {
		fs.rmSync(directory, { recursive: true, force: true });

		return true;
	} catch (err) {
		console.error(
			chalk.red(
				"There was an error! Make sure you aren't in the directory that you are deleting or that the server is still running."
			),
			err
		);

		return false;
	}
};

const prompt = async (directory: string) => {
	if (!checkForServer(directory)) {
		return;
	}

	if (await confirmation()) {
		const passed = deleteServer(directory);

		if (!passed) {
			return;
		}

		console.log(chalk.green(`Deleted server at ${directory}!`));
		return;
	}

	console.log(chalk.red('Cancelled.'));
	return;
};

const checkForServer = (directory: string) => {
	try {
		fs.readFileSync(path.resolve(path.join(directory, 'mserve.json')), 'utf8');
		return true;
	} catch (err) {
		console.error(chalk.red('\nThere is no server in this location or this path does not exist.'));
		return false;
	}
};

const Delete = async (args: Args) => {
	if (!args) {
		const route = await askDirectory();

		await prompt(route);
		return;
	}

	await prompt(path.resolve(args[0]));
};

export default Delete;
