const inquirer = require("inquirer");
const fetch = require("node-fetch");
const chalk = require("chalk");
const { program } = require("commander");

program
  .option("-c, --color [codigo]", "Añade un color", false)
  .option("-ab, --abrev [codigo]", "Añade un color", false);

program.parse();

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
            console.log(chalk.red.bold(`no existe la línea ${respuestasUsurio.linea}`));
            process.exit(0);
          } else {
            process.exit(0);
          }
        } else {
          const {
            NOM_LINIA, COLOR_LINIA, DESC_LINIA, CODI_LINIA
          } = res.features[0].properties;
          const colorConsola = program.opts().color !== false ? program.opts().color : COLOR_LINIA;
          console.log(chalk.hex(colorConsola)(`${NOM_LINIA} ${DESC_LINIA}`));
          fetch(`https://api.tmb.cat/v1/transit/linies/metro/${CODI_LINIA}/estacions?app_id=a372a6d9&app_key=de3506372e19c90a75a39c1fa2dc9fb7`)
            .then(res => res.json())
            .then(objParadas => {
              for (const parada of objParadas.features) {
                const { NOM_ESTACIO } = parada.properties;
                let paradaData = program.opts().abrev ? `${NOM_ESTACIO.slice(0, 3)}.` : NOM_ESTACIO;
                paradaData += respuestasUsurio.informacion.includes("Fecha de inauguración")
                  ? ` fecha inaguracion: ${parada.properties.DATA_INAUGURACIO}` : "";
                paradaData += respuestasUsurio.informacion.includes("Coordenadas")
                  ? ` cordenadas: ${parada.geometry.coordinates[0]} ${parada.geometry.coordinates[1]}` : "";
                console.log(paradaData);
              }
            });
        }
      });
  });
