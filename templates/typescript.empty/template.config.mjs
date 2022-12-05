import * as path from "node:path";
import * as fs from "node:fs";

const GITIGNORE = `/dist
/node_modules
**.swp
`;

export async function generate(rootDir, cli) {
    const name = await cli.prompt("Package name", {
        check: name => (name.length <= 214 && name.match(/^([^\._@]|@[a-z0-9\-_\.\~]+\/)[a-z0-9\-_\.\~\/]+$/)),
        defValue: path.basename(rootDir),
        required: true
    });
    const author = await cli.prompt("Author");
    const version = await cli.prompt("Package version", {
        defValue: "1.0.0",
        required: true
    });
    const desc = await cli.prompt("Description");
    const type = await cli.prompt("Package type (classic/module)", {
        check: name => ["classic", "module"].includes(name),
        defValue: "module"
    });
    const keywords = await cli.prompt("Keywords", {
        apply: inp => inp.split(" ").filter(v => v)
    });
    let repo = await cli.prompt("Git repository");
    const license = await cli.prompt("License", {
        defValue: "MIT",
        required: true
    });

    // #region package.json
    const packageInfo = {
        name, version,
        main: "dist/index.js",
        files: [
            "/dist/**/*.js",
            "/dist/**/*.d.ts"
        ],
        scripts: {
            "test": "node dist/test.js",
            "build": "tsc -b",
            "build:watch": "tsc -w"
        },
        keywords: keywords ?? [],
        license
    };

    if (desc) packageInfo.description = desc;
    if (type == "module") packageInfo.type = "module";
    if (author) packageInfo.author = author;
    if (repo) {
        packageInfo.repository = {
            type: "git",
            url: `git+${repo}`
        };

        if (repo.match(/^https?\:\/\/github.com/)) {
            if (repo.endsWith(".git")) repo = repo.substring(0, repo.indexOf(".git"));
            packageInfo.bugs = { url: `${repo}/issues` };
            packageInfo.homepage = `${repo}#readme`
        }
    }
    // #endregion
    // #region tsconfig.json
    const tsconfig = {
        compilerOptions: {
            module: type == "module"? "NodeNext" : "CommonJS",
            target: "ESNext",
            outDir: "dist",
            incremental: true,
            declaration: true
        },
        include: ["src"],
        exclude: ["node_modules"]
    };
    // #endregion
    
    await Promise.all([
        fs.promises.writeFile(path.join(rootDir, "package.json"), JSON.stringify(packageInfo, null, 2)),
        fs.promises.writeFile(path.join(rootDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 4)),
        fs.promises.writeFile(path.join(rootDir, ".gitignore"), GITIGNORE)
    ]);

    cli.info("You're all set! Some notes:");
    cli.info("- Include files by adding pattern to 'files' array in package.json");
    cli.info("- Build your project with 'npm run build'");
}
