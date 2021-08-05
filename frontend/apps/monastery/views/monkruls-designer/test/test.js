main();

async function main() {
    const input = await (await fetch("./testInput.json")).json();
    input.outputs.push({"name":"$failed_rules", "output":"__com_monastery_monkruls_decisiontabletester_failed_rules"});
    const webRuls = require("webRuls"); 
    const {results} = await webRuls.runRules(input);
    console.log(JSON.stringify(results, null, 4));
}