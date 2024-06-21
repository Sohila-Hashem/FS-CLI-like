import fs from "fs/promises";
import { constants } from "fs";

import chalk from "chalk";

export class Handlers {
	constructor() {
		throw new Error("this class can not be instantiated");
	}

	static #extractCommandContent(regex, content) {
		const commandContents = [];
		let currentMatched;

		if (!regex.global) {
			commandContents.push(content.match(regex)[1].trim());
		} else {
			while ((currentMatched = regex.exec(content)) !== null) {
				commandContents.push(currentMatched[1].trim());
			}
		}

		return commandContents;
	}

	static #logMessage(type, message) {
		const log = console.log;

		const logTypes = {
			warn: chalk.yellowBright,
			info: chalk.cyanBright,
			success: chalk.greenBright,
			error: chalk.red,
		};

		log(logTypes[type](message));
	}

	// handles create file
	static async handleCreateFile(content) {
		const regex = /CREATE FILE (.+);/g;
		const filePaths = this.#extractCommandContent(regex, content);

		const results = await Promise.allSettled(
			filePaths.map(async (path) => {
				try {
					await fs.access(path, constants.R_OK);
					return { status: "exists", content: { path } };
				} catch (error) {
					if (error.code === "ENOENT") {
						await fs.writeFile(path, "", "utf8");
						return { status: "success", content: { path } };
					} else {
						throw error;
					}
				}
			})
		);

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				const { status, content } = result.value;
				if (status === "success") {
					this.#logMessage("success", `created a new file at "${content.path}"`);
				} else if (status === "exists") {
					this.#logMessage("warn", `"${content.path}", already exists!`);
				}
			} else {
				this.#logMessage("error", result.reason);
			}
		});
	}

	// handles create folder
	static async handleCreateFolder(content) {
		const regex = /CREATE FOLDER (.+);/g;
		const folderPaths = this.#extractCommandContent(regex, content);

		const results = await Promise.allSettled(
			folderPaths.map(async (path) => {
				try {
					await fs.access(path, constants.R_OK);
					return { status: "exists", content: { path } };
				} catch (error) {
					if (error.code === "ENOENT") {
						await fs.mkdir(path, { recursive: true });
						return { status: "success", content: { path } };
					} else {
						throw error;
					}
				}
			})
		);

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				const { status, content } = result.value;
				if (status === "success") {
					this.#logMessage("success", `created a new folder at "${content.path}"`);
				} else if (status === "exists") {
					this.#logMessage("warn", `"${content.path}", already exists!`);
				}
			} else {
				this.#logMessage("error", result.reason);
			}
		});
	}

	// handles delete file
	static async handleDeleteFile(content) {
		const regex = /DELETE FILE (.+);/g;
		const filePaths = this.#extractCommandContent(regex, content);

		const results = await Promise.allSettled(
			filePaths.map(async (path) => {
				try {
					await fs.unlink(path);
					return { status: "success", content: { path } };
				} catch (error) {
					throw error;
				}
			})
		);

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				const { status, content } = result.value;
				if (status === "success") {
					this.#logMessage("success", `deleted a file at "${content.path}"`);
				}
			} else {
				this.#logMessage("error", result.reason);
			}
		});
	}

	// handles delete folder
	static async handleDeleteFolder(content) {
		const regex = /DELETE FOLDER ([^FORCE]+);/g;
		const folderPaths = this.#extractCommandContent(regex, content);

		const results = await Promise.allSettled(
			folderPaths.map(async (path) => {
				try {
					await fs.rmdir(path);
					return { status: "success", content: { path } };
				} catch (error) {
					throw error;
				}
			})
		);

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				const { status, content } = result.value;
				if (status === "success") {
					this.#logMessage("success", `deleted a folder at "${content.path}"`);
				}
			} else {
				this.#logMessage("error", result.reason);
			}
		});
	}

	// handles delete files or folders
	static async handleDeleteForce(content) {
		const regex = /DELETE ([^FORCE]+) FORCE;/g;
		const paths = this.#extractCommandContent(regex, content);

		const results = await Promise.allSettled(
			paths.map(async (path) => {
				try {
					await fs.rm(path, { force: true, recursive: true });
					return { status: "success", content: { path } };
				} catch (error) {
					console.log(error);
					throw error;
				}
			})
		);

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				const { status, content } = result.value;
				if (status === "success") {
					this.#logMessage(
						"success",
						`file/folder at "${content.path}" is deleted (or not found!)`
					);
				}
			} else {
				this.#logMessage("error", result.reason);
			}
		});
	}

	// handles append content to a file
	static async handleAppend(content) {
		const regexToExtractPath = /APPEND TO\s(.+)\sTHIS CONTENT:\s{0,3}"[^;]*";/g;
		const regexToExtractContent = /APPEND TO\s.+\sTHIS CONTENT:\s{0,3}"([^;]*)";/g;
		const paths = this.#extractCommandContent(regexToExtractPath, content);
		const appendedContent = this.#extractCommandContent(regexToExtractContent, content);

		const results = await Promise.allSettled(
			paths.map(async (path, idx) => {
				try {
					await fs.appendFile(path, appendedContent[idx]);
					return { status: "success", content: { path } };
				} catch (error) {
					throw error;
				}
			})
		);

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				const { status, content } = result.value;
				if (status === "success") {
					this.#logMessage(
						"success",
						`appended the specified content in "${content.path}"`
					);
				}
			} else {
				this.#logMessage("error", result.reason);
			}
		});
	}

	// handles write content to a file
	static async handleWrite(content) {
		const regexToExtractPath = /WRITE TO\s(.+)\sTHIS CONTENT:\s{0,3}"[^;]*";/g;
		const regexToExtractContent = /WRITE TO\s.+\sTHIS CONTENT:\s{0,3}"([^;]*)";/g;
		const paths = this.#extractCommandContent(regexToExtractPath, content);
		const writtenContent = this.#extractCommandContent(regexToExtractContent, content);

		const results = await Promise.allSettled(
			paths.map(async (path, idx) => {
				try {
					await fs.writeFile(path, writtenContent[idx]);
					return { status: "success", content: { path } };
				} catch (error) {
					throw error;
				}
			})
		);

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				const { status, content } = result.value;
				if (status === "success") {
					this.#logMessage("success", `wrote the specified content in "${content.path}"`);
				}
			} else {
				this.#logMessage("error", result.reason);
			}
		});
	}

	// handles rename
	static async handleRename(content) {
		const regexOldPath = /RENAME (.+) TO .+;/g;
		const regexNewPath = /RENAME .+ TO (.+);/g;
		const oldPaths = this.#extractCommandContent(regexOldPath, content);
		const newPaths = this.#extractCommandContent(regexNewPath, content);

		const results = await Promise.allSettled(
			oldPaths.map(async (path, idx) => {
				try {
					await fs.rename(path, newPaths[idx]);
					return { status: "success", content: { path, newPath: newPaths[idx] } };
				} catch (error) {
					throw error;
				}
			})
		);

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				const { status, content } = result.value;
				if (status === "success") {
					this.#logMessage(
						"success",
						`renamed "${content.path}" to "${content.newPath}"`
					);
				}
			} else {
				this.#logMessage("error", result.reason);
			}
		});
	}
}
