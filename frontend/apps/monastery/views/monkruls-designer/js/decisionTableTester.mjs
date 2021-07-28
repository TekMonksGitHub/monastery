/** 
 * Tests decision tables.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {monkrulsmodel} from "../model/monkrulsmodel.mjs";
const SPREAD_SHEET = monkshu_env.components["spread-sheet"], MODULE_PATH = util.getModulePath(import.meta);

async function test(callingSheetElement) {
    const hostElement = SPREAD_SHEET.getHostElement(callingSheetElement);
    const sheetValues = hostElement.value; if (sheetValues.Rules.trim() == "" || (!sheetValues.Rules)) return;  // nothing to test
    const model = JSON.parse(monkrulsmodel.getModelAsFile()); model.objects = [];

    // this model now has everything except rules is just the rules bundle for this decision table
    model.rule_bundles = [{ name: "testDecisionTable", "rules":[{decisiontable:`csv://${sheetValues.Rules}`}] }];

    // add in the objects
    for (const key in sheetValues) if (key == "Rules") continue; else model.objects.push({name: key, data: `csv://${sheetValues[key]}`});

    // ready to test now
    await $$.require(`${MODULE_PATH}/monkrulsBrowserified.min.js`); 
    const webRuls = require("webRuls"); const {results} = await webRuls.runRules(model);
    console.log(JSON.stringify(results, null, 4));
}

export const decisionTableTester = {test};