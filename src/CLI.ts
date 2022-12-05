import * as rl from "node:readline";

export class CLI {
    rlInterface: rl.Interface;

    public constructor() {
        this.rlInterface = rl.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    public async prompt(text: string, options: PromptOptions = {}) {
        do {
            const displayText = `${options.required? "*" : " "} ${text + (options.defValue? ` (${options.defValue})` : "")}: `;
            let value = await new Promise<string>(resolve => this.rlInterface.question(displayText, resolve));
            if (options.defValue && !value) value = options.defValue;

            if (options.required && !value) {
                this.err("This field is required.");
                continue;
            }
            if (options.check && !options.check(value)) {
                this.err("Invalid input: " + value);
                continue;
            }

            return options.apply? options.apply(value) : value;
        } while (true);
    }

    public info(text: string) { this.rlInterface.write(`\x1b[90mi\x1b[0m ${text}\n`); }
    public warn(text: string) { this.rlInterface.write(`\x1b[93;1m! \x1b[0;93m${text}\x1b[0m\n`); }
    public err(text: string) { this.rlInterface.write(`\x1b[91;1m! \x1b[0;91m${text}\x1b[0m\n`); }

    public close() {
        this.rlInterface.close();
    }
}

export interface PromptOptions {
    check?: (input: string) => boolean;
    defValue?: string;
    required?: boolean;
    apply?: (input: string) => any;
}
