import * as url from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";
import { CLI } from "./CLI.js";
import { Template } from "./Template.js";

const packageRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const templatesDir = path.join(packageRoot, "templates");
const args = process.argv.splice(2);
const packageInfo = JSON.parse(await fs.promises.readFile(path.join(packageRoot, "package.json"), "utf-8"));
const cli = new CLI();

function exit(code = 0) {
    cli.close();
    process.exit(code);
}

if (args.length == 0) {
    [
        `${packageInfo.name} v${packageInfo.version}`,
        "Usage:",
        "  mixery-templates (subcommand) [..args] [...-options]",
        "",
        "Subcommands:",
        "  version                       Print version number",
        "  list                          List all installed templates",
        "  new (Template name)           Create new project",
        "    --dir=(Project dir = .)       Generate project in another directory",
        "  install (Template name)       Install template",
        "    --dir=(Template dir = .)      Install template from directory"
    ].forEach(v => cli.info(v));
    exit();
}

const subcommands = {
    "version"() {
        process.stdout.write(packageInfo.version + "\n");
        exit(0);
    },
    async "list"() {
        const templates = await fs.promises.readdir(templatesDir);
        cli.info(`Templates (${templatesDir}):`);
        templates.forEach(t => cli.info(`- ${t}`));
        exit(0);
    },
    async "new"() {
        const dir = path.resolve(args.find(v => v.startsWith("--dir="))?.substring(6) ?? ".");
        if (!fs.existsSync(dir)) {
            cli.info(`Creating directory: ${dir}`);
            await fs.promises.mkdir(dir, { recursive: true });
        } else if ((await fs.promises.readdir(dir)).length > 0) {
            cli.warn(`Directory ${dir} already have contents! If you continue, some files might be overridden.`);
            const ans = await cli.prompt("Proceed? (y/n)", {
                check(input) { return ["y", "n"].includes(input); },
                defValue: "n",
                required: true
            });
            if (ans != "y") {
                cli.err("Aborted");
                exit(1);
            }
        }

        const templateId = args[1];
        if (!fs.existsSync(path.join(templatesDir, templateId))) {
            cli.err(`Template not found: ${templateId}`);
            cli.err(`Templates directory is ${templatesDir}`);
            exit(1);
        }

        cli.info(`${templateId} -> ${dir}`);
        const template = new Template(path.join(templatesDir, templateId));
        await template.generate(dir, cli);
        cli.info("Done");
        exit(0);
    },
    async "install"() {
        const dir = path.resolve(args.find(v => v.startsWith("--dir="))?.substring(6) ?? ".");
        const templateId = args[1];

        if (!fs.existsSync(dir)) {
            cli.err(`Directory does not exists: ${dir}`);
            exit(1);
        }
        if (!(await fs.promises.stat(dir)).isDirectory) {
            cli.err(`Is not a directory: ${dir}`);
            exit(1);
        }

        const destTemplateDir = path.join(templatesDir, templateId);
        if (fs.existsSync(destTemplateDir)) {
            cli.warn(`Template with id ${templateId} is already installed! If you continue, the previously installed template will be removed.`);
            const ans = await cli.prompt("Proceed? (y/n)", {
                check(input) { return ["y", "n"].includes(input); },
                defValue: "n",
                required: true
            });
            if (ans != "y") {
                cli.err("Aborted");
                exit(1);
            }

            cli.info(`Removing previously installed template...`);
            await fs.promises.rm(destTemplateDir, { recursive: true });
        }

        cli.info(`Installing template ${templateId}...`);
        await fs.promises.cp(dir, destTemplateDir, { recursive: true });
        cli.info("Done");
        exit(0);
    }
};

const subcommand = subcommands[args[0]];
if (!subcommand) {
    cli.err(`Invalid subcommand: ${args[0]}`);
    exit(1);
}
subcommand();
