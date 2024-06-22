import fs from "fs/promises";

import chalk from "chalk";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import { Handlers } from "../Handlers.js";

use(chaiAsPromised);

describe("Handlers", () => {
	let logSpy;

	beforeEach(() => {
		logSpy = sinon.spy(console, "log");
	});

	afterEach(() => {
		sinon.restore();
	});

	describe("#handleCreateFile", () => {
		it("create a file when the file does not exists", async () => {
			const content = "CREATE FILE tmp/test.txt;";

			sinon.stub(fs, "access").rejects({ code: "ENOENT" });
			sinon.stub(fs, "writeFile").resolves();

			await Handlers.handleCreateFile(content);

			expect(logSpy.calledWith(chalk.greenBright('created a new file at "tmp/test.txt"'))).to
				.be.true;
		});

		it("log a warning when the file already exists", async () => {
			const content = "CREATE FILE tmp/test.txt;";

			sinon.stub(fs, "access").resolves();

			await Handlers.handleCreateFile(content);

			expect(logSpy.calledWith(chalk.yellowBright('"tmp/test.txt", already exists!'))).to.be
				.true;
		});
	});

	describe("#handleCreateFolder", () => {
		it("creates a folder when the folder does not exists", async () => {
			const content = "CREATE FOLDER tmp;";

			sinon.stub(fs, "access").rejects({ code: "ENOENT" });
			sinon.stub(fs, "mkdir").resolves();

			await Handlers.handleCreateFolder(content);

			expect(logSpy.calledWith(chalk.greenBright('created a new folder at "tmp"'))).to.be
				.true;
		});

		it("log a warning when the folder does exists", async () => {
			const content = "CREATE FOLDER tmp;";

			sinon.stub(fs, "access").resolves();

			await Handlers.handleCreateFolder(content);

			expect(logSpy.calledWith(chalk.yellowBright('"tmp", already exists!'))).to.be.true;
		});
	});

	describe("#handleDeleteFile", () => {
		it("deletes a file when the file does exists", async () => {
			const content = "DELETE FILE tmp/test.txt;";

			sinon.stub(fs, "unlink").resolves();

			await Handlers.handleDeleteFile(content);

			expect(logSpy.calledWith(chalk.greenBright('deleted a file at "tmp/test.txt"'))).to.be
				.true;
		});

		it("log an error when the file does not exists or the path is wrong", async () => {
			const content = "DELETE FILE tmp/test.txt;";

			sinon.stub(fs, "unlink").rejects({ code: "ENOENT" });

			await Handlers.handleDeleteFile(content);

			expect(logSpy.calledOnce).to.be.true;
		});
	});

	describe("#handleDeleteFolder", () => {
		it("deletes a folder when the folder does exists", async () => {
			const content = "DELETE FOLDER tmp;";

			sinon.stub(fs, "rmdir").resolves();

			await Handlers.handleDeleteFolder(content);

			expect(logSpy.calledWith(chalk.greenBright('deleted a folder at "tmp"'))).to.be.true;
		});

		it("log an error when the folder does not exists or the path is wrong", async () => {
			const content = "DELETE FOLDER tmp;";

			sinon.stub(fs, "rmdir").rejects({ code: "ENOENT" });

			await Handlers.handleDeleteFolder(content);

			expect(logSpy.calledOnce).to.be.true;
		});
	});

	describe("#handleDeleteForce", () => {
		it("deletes a nested folder when the path does exists (or not)", async () => {
			const content = "DELETE tmp-1/tmp-2/tmp-3 FORCE;";
			const path = "tmp-1/tmp-2/tmp-3";

			sinon.stub(fs, "rm").calledWith(path, { recursive: true, force: true });

			await Handlers.handleDeleteForce(content);

			expect(
				logSpy.calledWith(
					chalk.greenBright(
						'file/folder at "tmp-1/tmp-2/tmp-3" is deleted (or not found!)'
					)
				)
			).to.be.true;
		});

		it("deletes a nested file when the path does exists (or not)", async () => {
			const content = "DELETE tmp-1/tmp-2/tmp-3.txt FORCE;";
			const path = "tmp-1/tmp-2/tmp-3.txt";

			sinon.stub(fs, "rm").calledWith(path, { recursive: true, force: true });

			await Handlers.handleDeleteForce(content);

			expect(
				logSpy.calledWith(
					chalk.greenBright(
						'file/folder at "tmp-1/tmp-2/tmp-3.txt" is deleted (or not found!)'
					)
				)
			).to.be.true;
		});
	});

	describe("#handleAppend", () => {
		it("append content to a file when the file does exists", async () => {
			const content = `APPEND TO tmp.txt THIS CONTENT: "hello world!";`;

			sinon.stub(fs, "appendFile").resolves();

			await Handlers.handleAppend(content);

			expect(
				logSpy.calledWith(chalk.greenBright('appended the specified content in "tmp.txt"'))
			).to.be.true;
		});

		it("log an error when the file does not exists or the path is wrong", async () => {
			const content = `APPEND TO tmp.txt THIS CONTENT: "hello world!";`;

			sinon.stub(fs, "appendFile").rejects({ code: "ENOENT" });

			await Handlers.handleAppend(content);

			expect(logSpy.calledOnce).to.be.true;
		});
	});

	describe("#handleWrite", () => {
		it("write/overwrite content to a file when the file does exists", async () => {
			const content = `WRITE TO tmp.txt THIS CONTENT: "hello world!";`;

			sinon.stub(fs, "writeFile").resolves();

			await Handlers.handleWrite(content);

			expect(logSpy.calledWith(chalk.greenBright('wrote the specified content in "tmp.txt"')))
				.to.be.true;
		});

		it("log an error when the file does not exists or the path is wrong", async () => {
			const content = `WRITE TO tmp.txt THIS CONTENT: "hello world!";`;

			sinon.stub(fs, "writeFile").rejects({ code: "ENOENT" });

			await Handlers.handleWrite(content);

			expect(logSpy.calledOnce).to.be.true;
		});
	});

	describe("#handleRename", () => {
		it("renames a file when the file does exists", async () => {
			const content = "RENAME temp.txt TO tmp.txt;";

			sinon.stub(fs, "rename").resolves();

			await Handlers.handleRename(content);

			expect(logSpy.calledWith(chalk.greenBright('renamed "temp.txt" to "tmp.txt"'))).to.be
				.true;
		});

		it("log an error when the file does not exists or the path is wrong", async () => {
			const content = "RENAME temp.txt TO tmp.txt;";

			sinon.stub(fs, "rename").rejects({ code: "ENOENT" });

			await Handlers.handleRename(content);

			expect(logSpy.calledOnce).to.be.true;
		});

		it("renames a folder when the folder does exists", async () => {
			const content = "RENAME temp TO tmp;";

			sinon.stub(fs, "rename").resolves();

			await Handlers.handleRename(content);

			expect(logSpy.calledWith(chalk.greenBright('renamed "temp" to "tmp"'))).to.be.true;
		});

		it("log an error when the folder does not exists or the path is wrong", async () => {
			const content = "RENAME temp TO tmp;";

			sinon.stub(fs, "rename").rejects({ code: "ENOENT" });

			await Handlers.handleRename(content);

			expect(logSpy.calledOnce).to.be.true;
		});
	});
});
