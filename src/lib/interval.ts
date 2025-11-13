import Backup from '../commands/backup.ts';

export const intervalBackup = (directory: string, storage: MserveJson) => {
	if (!storage.auto_backup || !storage.auto_backup.includes('interval')) {
		return null;
	}

	const interval = setInterval(() => {
		Backup([directory]);
	}, (storage.auto_backup_interval ?? 120) * 1000 * 60); // every 2 hours by default;

	return interval;
};

// export const intervalClear = (directory, storage) => {
//    if (storage.extra && !storage.extra.includes('Interval Old Backup Deletion')) {
//       return null;
//    }

//    const interval = setInterval(() => {
//       Backup([directory]);
//    }, (storage.interval ?? 120) * 1000 * 60);

//    return interval;
// }
