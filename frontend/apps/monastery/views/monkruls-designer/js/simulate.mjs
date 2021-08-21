/** 
 * Simulate running of all rules.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {monkrulsmodel} from "../model/monkrulsmodel.mjs";

const MODULE_PATH = util.getModulePath(import.meta);

async function test() {
    const model = JSON.parse(monkrulsmodel.getModelAsFile().data); 

    model.outputs.push({name:"$failed_rules", output:"__com_monastery_monkruls_decisiontabletester_failed_rules"});

    // add in the objects and we want all objects back as outputs as well
    const dndObjectsToTest = JSON.parse(window.monkshu_env.components["drag-drop"].getHostElementByID("doTestWithObjects").value);
    const objectIDsToTest = []; for (const object of dndObjectsToTest) objectIDsToTest.push(object.id);
    const objectsToTest = []; for (const object of model.objects) if (objectIDsToTest.includes(object.id)) objectsToTest.push(object);
    model.objects = objectsToTest; for (const object of objectsToTest) model.outputs.push({name: object.name, output: object.name});

    // run the rules engine 
    await $$.require(`${MODULE_PATH}/monkrulsBrowserified.min.js`); 
    const webRuls = require("webRuls"); const {results} = await webRuls.runRules(model);

    // update output
    const output = `${await i18n.get("RulesOutputLabel")}\n\n${JSON.stringify(results, null, 4)}`; LOG.console(output);
    const textareaOutput = window.monkshu_env.components["html-fragment"].getShadowRootByHostId("output").querySelector("textarea");
    textareaOutput.value = output;
}

export const simulate = {test};