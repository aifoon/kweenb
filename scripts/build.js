/**
 * Starts the production environment
 */

const ProdEnvironment = require("./lib/ProdEnvironment");

async function main() {
  // create a new production environment
  const prodEnvironment = new ProdEnvironment();

  // start the production environment
  await prodEnvironment.start();
}

main();
