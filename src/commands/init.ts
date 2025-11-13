import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { checkbox, confirm, input } from '@inquirer/prompts';
import { askDirectory } from '../utils.ts';
import { createSpinner } from 'nanospinner';

type Form = MserveJson & {
	directory: string;
};

const storeData = (directory: string, data: MserveJson) => {
	const stored = JSON.stringify(data);

	fs.writeFile(directory, stored, (err) => {
		console.error(err);
	});
};

const checkForDirectory = async (directory: string) => {
	if (fs.existsSync(directory)) {
		return true;
	}

	console.log(chalk.yellow('The folder for the server does not exist.'));

	const confirmation = await confirm({
		message: `Would you like to create the directory? (${directory})`,
	});

	if (!confirmation) {
		console.error(chalk.red("\nOkay, exited setup. Can't continue without a valid directory."));
		return false;
	}

	try {
		fs.mkdirSync(directory, { recursive: true });
	} catch (err) {
		console.error(chalk.bold('\nThere was an error creating the folder.'));
		return false;
	}

	return true;
};

const checkForServer = (directory: string) => {
	if (
		fs.existsSync(path.join(directory, 'mserve.json')) ||
		fs.existsSync(path.join(directory, 'server.properties')) ||
		fs.existsSync(path.join(directory, 'config.yml'))
	) {
		console.error(chalk.red('There is already a server in this location.'));
		return true;
	}

	return false;
};

const completeForm = async (directory: string) => {
	if (!(await checkForDirectory(directory))) {
		return;
	}

	if (checkForServer(directory)) {
		return;
	}

	const file = await input({
		message: 'What is the name of the server jar? (Include the .jar)',
		default: 'server.jar',
	});

	const ram = await input({
		message: 'How many GB of ram?',
		default: '3',
	});

	const auto_restart = await confirm({
		message: 'Do you want the server to automatically restart when it closes?',
	});

	console.log(
		`${chalk.bgYellow('Warning!')} ${chalk.bold(
			'Backup features will require a high amount of storage space.'
		)}`
	);

	const auto_backup: MserveJson['auto_backup'] = await checkbox({
		message: 'What ways would you like to auto backup?',
		choices: ['interval', 'on_close', 'on_start'],
	});

	let interval = '120';

	if (auto_backup.includes('interval')) {
		interval = await input({
			message: 'How long should the interval be? (in minutes; e.g. 120 = 2h)',
			default: '120',
		});
	}

	const form: Form = {
		auto_backup: auto_backup,
		ram: Number(ram),
		directory,
		file,
		auto_backup_interval: Number(interval),
		auto_restart,
		createdAt: new Date(),
	};

	await initializeServer(form);
};

// TODO: make a function that will attempt to automatically move the server jar file (collected from form andcalled in initilaizeServer). check the users downloads. if unsuccessfull simply put couldnt move automove file

const initializeServer = async (form: Form) => {
	const spinner = createSpinner(`${chalk.gray(`Creating mserve.json...`)}`).start();

	storeData(path.join(form.directory, 'mserve.json'), form);
	spinner.update({ text: `Attempting to auto-move ${form.file}` });

	// attempt to find the jar in common locations and move it into the server directory
	const attemptAutoMove = (filename: string) => {
		const home = process.env.HOME || process.env.USERPROFILE || '';
		const candidates = [
			path.join(process.cwd(), filename),
			path.join(home, 'Downloads', filename),
			path.join(home, 'downloads', filename),
			path.join(home, 'Desktop', filename),
			path.join(home, filename),
		];

		const dest = path.join(form.directory, filename);

		for (const src of candidates) {
			try {
				if (!src) continue;
				if (!fs.existsSync(src)) continue;

				// if destination already exists, don't overwrite
				if (fs.existsSync(dest)) {
					return { ok: false, reason: `Destination already contains ${filename}` };
				}

				// try rename (fast move). If that fails, fall back to copy + unlink.
				try {
					fs.renameSync(src, dest);
					return { ok: true, src };
				} catch (err) {
					try {
						fs.copyFileSync(src, dest);
						// best-effort remove original
						try {
							fs.unlinkSync(src);
						} catch {}
						return { ok: true, src };
					} catch (copyErr) {
						// continue to next candidate
					}
				}
			} catch {
				// ignore and continue
			}
		}

		return { ok: false };
	};

	const result = attemptAutoMove(form.file);

	if (result.ok) {
		spinner.update({ text: `Auto-moved ${form.file} from ${result.src} to ${form.directory}` });
	} else if (result.reason) {
		spinner.update({ text: `Couldn't auto-move ${form.file}: ${result.reason}` });
	} else {
		spinner.update({
			text: `Couldn't auto-move ${form.file}. Please place the file manually in: ${form.directory}`,
		});
	}

	spinner.success({ text: `${chalk.green('Initilization complete!')}` });
};

const Init = async (args: Args) => {
	if (!args) {
		const route = await askDirectory();
		await completeForm(route);

		return;
	}

	await completeForm(path.resolve(args[0]));
};

export default Init;
