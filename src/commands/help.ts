import chalk from 'chalk';

const commands = [
	{
		name: 'help',
		description: 'How much help do you need??',
		args: ['<command>'],
	},
	{
		name: 'docs',
		description: 'Shows link to documentation.',
		args: ['open'],
	},
	{
		name: 'init',
		description: 'Makes a new customizable server.',
		args: ['<directory>'],
	},
	{
		name: 'serve',
		description: 'Starts a server of choice. (Must be first made by `mserve init`)',
		args: ['<directory>'],
	},
	{
		name: 'backup',
		description: "Makes a backup of a server's world files. (Folders with a `level.dat`)",
		args: ['<directory>'],
	},
	{
		name: 'delete',
		description: 'Deletes a server of choice.',
		args: ['<directory>'],
	},
];

const Help = (args: Args) => {
	console.log(
		`\n${chalk.green('➜')} ${chalk.bold('More info about mserve at')} ${chalk.blueBright(
			'https://neotap.net/mserve'
		)}`
	);

	if (!args) {
		console.log('Avaliable commands are:');
		console.log('Note: arguments are always optional.');

		commands.forEach((e) => {
			console.log(
				`mserve ${chalk.blueBright(e.name)}${chalk.gray(
					e.args.map((e) => {
						return ' ' + e;
					})
				)}`
			);
		});

		return;
	}

	let found = false;

	commands.forEach((e) => {
		if (e.name === args[0]) {
			console.log(chalk.blueBright('\n' + e.name));
			console.log(e.description);

			found = true;
		}
	});

	if (found) {
		return;
	}

	console.log(chalk.red(`Command \`${args[0]}\` not found.`));
};

export default Help;
