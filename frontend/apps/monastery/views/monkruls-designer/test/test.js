main();

async function main() {
    const input = await (await fetch("./testInput.json")).json();
    const webRuls = require("webRuls"); 
    const {results} = await webRuls.runRules(input);
    console.log(JSON.stringify(results, null, 4));
}