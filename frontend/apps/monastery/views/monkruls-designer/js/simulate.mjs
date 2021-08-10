/** 
 * Simulate running of all rules.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import {util} from "/framework/js/util.mjs";
import {monkrulsmodel} from "../model/monkrulsmodel.mjs";
import {page_generator} from "/framework/components/page-generator/page-generator.mjs";

const MODULE_PATH = util.getModulePath(import.meta), VIEW_PATH=`${MODULE_PATH}/../`, 
    SAVED_PROPS = {allTestObjects:[], doTestWithObjects: []},
    DRAG_DROP_ELEMENT_IDS = ["allTestObjects", "doTestWithObjects"], TEST_OBJECT_IMG = `${MODULE_PATH}/../dialogs/object.svg`;

async function test(callingElement) {
    const model = JSON.parse(monkrulsmodel.getModelAsFile().data); model.objects = [];

    model.outputs.push({"name":"$failed_rules", "output":"__com_monastery_monkruls_decisiontabletester_failed_rules"});

    // add in the objects and we want all objects back as outputs as well

    // ready to test now
    await $$.require(`${MODULE_PATH}/monkrulsBrowserified.min.js`); 
    const webRuls = require("webRuls"); const {results} = await webRuls.runRules(model);
    LOG.console(`Output of the rules engine follows\n\n${JSON.stringify(results, null, 4)}`);
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