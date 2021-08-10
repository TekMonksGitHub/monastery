/** 
 * Simulate running of all rules.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {monkrulsmodel} from "../model/monkrulsmodel.mjs";
import {page_generator} from "/framework/components/page-generator/page-generator.mjs";

const MODULE_PATH = util.getModulePath(import.meta), VIEW_PATH=`${MODULE_PATH}/../`, 
    SAVED_PROPS = {allTestObjects:[], doTestWithObjects: []},
    DRAG_DROP_ELEMENT_IDS = ["allTestObjects", "doTestWithObjects"], TEST_OBJECT_IMG = `${MODULE_PATH}/../dialogs/object.svg`,
    OUTPUT_LABEL = await i18n.get("RulesOutputLabel");

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
    const output = `${OUTPUT_LABEL}\n\n${JSON.stringify(results, null, 4)}`; LOG.console(output);
    const textareaOutput = window.monkshu_env.components["html-fragment"].getShadowRootByHostId("output").querySelector("textarea");
    textareaOutput.value = output;
}

async function openFile() {

}

async function saveFile() {
    
}

async function open() {
    let pageFile =  `${VIEW_PATH}/dialogs/dialog_simulate.page`;
    
    let html = await page_generator.getHTML(new URL(pageFile), undefined, {buttonbarData: JSON.stringify({})});

    const dom = new DOMParser().parseFromString(html, "text/html");
    const dragDropLists = _fillObjectsForDragDropLists(); for (const id of DRAG_DROP_ELEMENT_IDS) 
        dom.querySelector(`#${id}`).setAttribute("value", dragDropLists[id]);
    html = dom.documentElement.outerHTML;   // this creates HTML with default values set from the previous run

    // now show and run the dialog
    const dialogPropertiesPath = `${VIEW_PATH}/dialogs/dialogPropertiessimulate.json`;
    window.monkshu_env.components["dialog-box"].showDialog(dialogPropertiesPath, html, null, DRAG_DROP_ELEMENT_IDS, 
        (typeOfClose, result) => { if (typeOfClose == "submit") {
            SAVED_PROPS.allTestObjects = _getAllIDsForObjectList(result.allTestObjects);
            SAVED_PROPS.doTestWithObjects = _getAllIDsForObjectList(result.doTestWithObjects);
            return true;} });
}

function _fillObjectsForDragDropLists() {
    const model = JSON.parse(monkrulsmodel.getModelAsFile().data);
    const result = {allTestObjects:[], doTestWithObjects: []}; for (const object of model.objects) {
        const dndObject = {id: object.id, img: TEST_OBJECT_IMG, label: object.description};
        if (SAVED_PROPS.allTestObjects.includes(dndObject.id)) result.allTestObjects.push(dndObject);
        else if (SAVED_PROPS.doTestWithObjects.includes(object.id)) result.doTestWithObjects.push(dndObject);
        else result.allTestObjects.push(dndObject);
    }; 
    return {allTestObjects: JSON.stringify(result.allTestObjects), doTestWithObjects: JSON.stringify(result.doTestWithObjects)};
}

function _getAllIDsForObjectList(dndObjectList) {
    const retIDs = []; for (const dndObject of JSON.parse(dndObjectList)) retIDs.push(dndObject.id);
    return retIDs;
}

export const simulate = {test, openFile, saveFile, open};