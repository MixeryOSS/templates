import { CLI } from "./CLI.js";
import * as fs from "node:fs";
import * as path from "node:path";

export interface TemplateConfig {
    generate?(rootDir: string, cli: CLI): Promise<any>;
}

async function recursiveCopy(from: string, to: string, filter: (name: string, from: string, to: string) => boolean = () => true) {
    const stat = await fs.promises.stat(from);
    if (!stat.isDirectory()) return await fs.promises.copyFile(from, to);

    if (!fs.existsSync(to)) await fs.promises.mkdir(to, { recursive: true });
    await Promise.all((await fs.promises.readdir(from)).filter(v => filter(v, path.join(from, v), path.join(to, v))).map(v => recursiveCopy(path.join(from, v), path.join(to, v))));
}

export class Template {
    config: TemplateConfig;

    public constructor(public readonly templateRoot: string) {}

    public async load() {
        if (!this.config) {
            const configPath = path.join(this.templateRoot, "template.config.mjs");
            if (!fs.existsSync(configPath)) this.config = {};
            else this.config = await import(configPath);
        }
    }

    public async generate(rootDir: string, cli: CLI) {
        await this.load();
        await recursiveCopy(this.templateRoot, rootDir, v => !v.match(/^template\./));

        if (this.config.generate) await this.config.generate(rootDir, cli);
        else cli.info("This template does not have options");
    }
}
