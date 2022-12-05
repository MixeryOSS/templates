import * as url from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";
import { Template } from "./Template.js";
import { CLI } from "./CLI.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

let template = new Template(path.join(dirname, "..", "templates", "typescript.empty"));
await fs.promises.mkdir("test-proj");

let cli = new CLI();
await template.generate("test-proj", cli);
cli.close();

