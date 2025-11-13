interface MserveJson {
	/**
	 * @default server.jar
	 */
	file: string;
	provider?: string;
	version?: string;
	/**
	 * @default 3
	 */
	ram?: number;
	/**
	 * @default ['interval', 'on_close']
	 */
	auto_backup?: Array<'interval' | 'on_close' | 'on_start'>;
	/**
	 * In minutes
	 * @default 120
	 */
	auto_backup_interval?: number;
	/**
	 * @default false
	 */
	auto_restart?: boolean;
	custom_flags?: string[];
	createdAt?: Date;
}

type Args = string[] | undefined;
