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
  .then(respuestasUsurio => {
    fetch(`https://api.tmb.cat/v1/transit/linies/metro?filter=NOM_LINIA='${respuestasUsurio.linea}'&app_id=a372a6d9&app_key=de3506372e19c90a75a39c1fa2dc9fb7`)
      .then(res => res.json())
      .then(res => {
        if (res.numberMatched === 0) {
          if (respuestasUsurio.errores) {
            console.log(chalk.red.bold(`no existe la línea${respuestasUsurio.linea}`));
            process.exit(0);
          } else {
            process.exit(0);
          }
        } else {
          let colorConsola;
          if (program.opts().color !== false) {
            colorConsola = program.opts().color;
          } else colorConsola = res.features[0].properties.COLOR_LINIA;
          console.log(chalk.hex(colorConsola)(`${res.features[0].properties.NOM_LINIA} ${res.features[0].properties.DESC_LINIA}`));
        }
      });
  });
