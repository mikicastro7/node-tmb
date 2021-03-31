const inquirer = require("inquirer");
const fetch = require("node-fetch");
const chalk = require("chalk");
const { program } = require("commander");

program
  .option("-c, --color [codigo]", "Añade un color", false)
  .option("-ab, --abrev [codigo]", "Añade un color", false);

program.parse();

console.log(`color: ${program.opts().abrev}`);

inquirer.prompt([
  {
    type: "list",
    name: "transporte",
    message: "¿Qué tipo de transporte quiere consultar?",
    choices: ["Metro", "Bus"],
  },
  {
    type: "checkbox",
    name: "informacion",
    message: "¿Qué información extra quiere obtener de cada parada?",
    choices: ["Coordenadas", "Fecha de inauguración"],
    when: (answare) => {
      if (answare.transporte === "Bus") {
        console.log(chalk.yellow("no tenemos información disponible sobre los buses (www.tmb.cat)"));
        process.exit(0);
      } else return true;
    }
  },
  {
    type: "confirm",
    name: "errores",
    message: "Quiere que le informemos de los errores"
  },
  {
    type: "input",
    name: "linea",
    message: "¿Qué línea quiere consultar?"
  }
])
  .then(res => {

  });
