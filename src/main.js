import fs from "fs/promises";

import { Handlers } from "./Handlers.js";
import constants from "./config/constants/COMMANDS.js";
import debounce from "./utils/debounce.js";

const handleChange = async (pathToWatchedFile) => {
	try {
		const watcherContent = await fs.readFile(pathToWatchedFile, "utf-8");

		// create file
		if (watcherContent.includes(constants.CREATE_FILE)) {
			await Handlers.handleCreateFile(watcherContent);
		}

		// create folder
		if (watcherContent.includes(constants.CREATE_FOLDER)) {
			await Handlers.handleCreateFolder(watcherContent);
		}

		// delete file
		if (watcherContent.includes(constants.DELETE_FILE)) {
			await Handlers.handleDeleteFile(watcherContent);
		}

		// delete folder
		if (
			watcherContent.includes(constants.DELETE_FOLDER) &&
			!watcherContent.includes(constants.DELETE_FOLDER_FORCE.sub)
		) {
			await Handlers.handleDeleteFolder(watcherContent);
		}

		// delete folder recursively
		if (
			watcherContent.includes(constants.DELETE_FOLDER_FORCE.main) &&
			watcherContent.includes(constants.DELETE_FOLDER_FORCE.sub)
		) {
			await Handlers.handleDeleteForce(watcherContent);
		}

		// write to a file
		if (
			watcherContent.includes(constants.WRITE.main) &&
			watcherContent.includes(constants.WRITE.sub)
		) {
			await Handlers.handleWrite(watcherContent);
		}

		// append to a file
		if (
			watcherContent.includes(constants.APPEND.main) &&
			watcherContent.includes(constants.APPEND.sub)
		) {
			await Handlers.handleAppend(watcherContent);
		}

		// rename a file
		if (
			watcherContent.includes(constants.RENAME.main) &&
			watcherContent.includes(constants.RENAME.sub)
		) {
			await Handlers.handleRename(watcherContent);
		}
	} catch (error) {
		throw error;
	}
};

const debouncedHandleChange = debounce(handleChange, 200);

/**
 * @param {String} pathToWatchedFile - path to watched file
 */
const handyCmd = async (pathToWatchedFile) => {
	try {
		const watcher = fs.watch(pathToWatchedFile);

		for await (const event of watcher) {
			if (event.eventType === "change") {
				debouncedHandleChange(pathToWatchedFile);
			}
		}
	} catch (error) {
		console.log(`${error}`);
	}
};

export default handyCmd;
