import { Command } from "commander";
const program = new Command();

/* program
  .version("1.0.0", "-v, --version")
  .usage("[OPTIONS]...")
  .option("-f, --flag", "Detects if the flag is present.")
  .option("-c, --custom <value>", "Overwriting value.", "Default")
  .option("--first, custom <value>", "No.1", "First")
  .parse(process.argv);

const options = program.opts();

const flag = options.flag ? "Flag is present." : "Flag is not present.";
const first = options.first ? "First is present" : "First is not present";

console.log("Flag:", `${flag}`);
console.log("Custom:", `${options.custom}`);
console.log("First: ", `${options.custom}`); */

program
  .name("string-util")
  .description("CLI to some JavaScript string utilities")
  .version("0.8.0");

program
  .command("split")
  .description("Split a string into substrings and display as an array")
  .argument("<string>", "string to split")
  .option("--first", "display just the first substring")
  .option("-s, --separator <char>", "separator character", ",")
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program.parse();
