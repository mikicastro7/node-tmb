const chalk = require("chalk");

const preguntas = [
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
];
module.exports = preguntas;
