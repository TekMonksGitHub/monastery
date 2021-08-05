/** 
 * Tests decision tables.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {monkrulsmodel} from "../model/monkrulsmodel.mjs";
const SPREAD_SHEET = monkshu_env.components["spread-sheet"], MODULE_PATH = util.getModulePath(import.meta);

async function test(callingSheetElement) {
    const hostElement = SPREAD_SHEET.getHostElement(callingSheetElement), sheetValue = hostElement.value;
    const rulesCSV = _getSheetTabData(sheetValue, "Rules");  if (!rulesCSV) return; // nothing to test
    const model = JSON.parse(monkrulsmodel.getModelAsFile().data); model.objects = [];

    // this model now has everything except rules is just the rules bundle for this decision table, and we do want
    // the failed_rules object back as output
    model.rule_bundles = [{ name: "testDecisionTable", "rules":[{decisiontable:`csv://${rulesCSV}`}] }];
    model.outputs.push({"name":"$failed_rules", "output":"__com_monastery_monkruls_decisiontabletester_failed_rules"});

    // add in the objects and we want all objects back as outputs as well
    const tabNames = _getSheetTabNames(sheetValue);
    for (const tabName of tabNames) if (tabName == "Rules") continue; else {
        model.objects.push({name: tabName, data: `csv://${_getSheetTabData(sheetValue, tabName)}`});
        model.outputs.push({name: tabName, output: tabName});
    }

    // ready to test now
    await $$.require(`${MODULE_PATH}/monkrulsBrowserified.min.js`); 
    const webRuls = require("webRuls"); const {results} = await webRuls.runRules(model);
    LOG.info(`Output of the rules engine follows\n\n${JSON.stringify(results, null, 4)}`);

    // highlight failed rules in the spreadsheet
    const rowsFailed = []; for (const failed_rule of results.__com_monastery_monkruls_decisiontabletester_failed_rules) rowsFailed.push(failed_rule.index);
    LOG.info(`Failed rule rows are ${rowsFailed.join(", ")}`);
}

function _getSheetTabData(sheetProperties, tabName) {
    for (const object of JSON.parse(sheetProperties)) if (object.id == tabName) return object.data;
    return null;
}

function _getSheetTabNames(sheetProperties) {
    const tabNames = []; for (const object of JSON.parse(sheetProperties)) tabNames.push(object.id);
    return tabNames;
}

export const decisionTableTester = {test};