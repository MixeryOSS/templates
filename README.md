# Templates
_Quickly create new project with just a single command_

Templates provides with ``typescript.empty`` by default. Use that to quickly create new empty TypeScript project.

## Installing Templates
Install Templates by using ``npm``:

```console
$ npm i -g @mixery/templates
```

## Usage
> Run ``mixery-templates`` without arguments to view the message below.

```console
$ mixery-templates
i @mixery/templates v1.0.0
i Usage:
i   mixery-templates (subcommand) [..args] [...-options]
i
i Subcommands:
i   version                       Print version number
i   list                          List all installed templates
i   new (Template name)           Create new project
i     --dir=(Project dir = .)       Generate project in another directory
i   install (Template name)       Install template
i     --dir=(Template dir = .)      Install template from directory
```

## Make your own template
### From existing template
You can clone existing template and modify it. Simply find the path where your templates are installed (``mixery-templates list`` to see it), then clone the template that you want to "fork".

### From nothing
Any directory can be considered as "template" if it has at least 1 file.

### Beyond files: ``template.config.mjs``
``template.config.mjs`` is a special file that can be used to configure your newly created project. See [typescript.empty](./templates/typescript.empty/template.config.mjs) for example.

Your ``template.config.mjs`` file may exports a function with this signature:
```ts
/**
 * @param rootDir Project directory
 * @param cli The terminal. Read user's input with ``cli.prompt()``
 */
export function generate(rootDir: string, cli: templates.CLI): Promise<any>;
```

### Exporting template
You can export the template by finding the directory that stores all installed templates, then archive it with any archiver command that you have (``tar`` for example).

TODO: add ``export`` subcommand.
