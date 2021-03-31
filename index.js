const inquirer = require("inquirer");
const fetch = require("node-fetch");
const chalk = require("chalk");
const { program } = require("commander");
require("dotenv").config();

const preguntas = require("./preguntas");

program
  .option("-c, --color [codigo]", "Añade un color", false)
  .option("-ab, --abrev [codigo]", "Añade un color", false);

program.parse();

inquirer.prompt(preguntas)
  .then(respuestasUsurio => {
    fetch(`${process.env.TMB_API_LINEAS}?&${process.env.TMB_API_AUT}&filter=NOM_LINIA='${respuestasUsurio.linea}'`)
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
          fetch(`${process.env.TMB_API_LINEAS}/${CODI_LINIA}/estacions?${process.env.TMB_API_AUT}`)
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
