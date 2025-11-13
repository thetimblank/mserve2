import chalk from 'chalk';
import open from 'open';

const Docs = async (args: Args) => {
	console.log(
		`\n${chalk.green('➜')} ${chalk.bold('You can find the documentation at')} ${chalk.blueBright(
			'https://docs.neotap.net/mserve'
		)}`
	);
	console.log(chalk.gray("Use 'mserve docs open' to open directly"));

	if (!args || args[0] != 'open') {
		return;
	}

	await open('https://docs.neotap.net/mserve');

	return;
};

export default Docs;
