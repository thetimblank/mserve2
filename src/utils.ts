import { input } from '@inquirer/prompts';
import path from 'path';

export const askDirectory = async () => {
	const directory = await input({
		message: 'Which directory',
		default: '.',
	});

	return path.resolve(directory);
};
