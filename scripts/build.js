/**
 * Starts the production environment
 */

const ProdEnvironment = require("./lib/ProdEnvironment");

async function main() {
  // create a new dev environment
  const prodEnvironment = new ProdEnvironment();

  // start the dev environment
  await prodEnvironment.start();
}

main();
