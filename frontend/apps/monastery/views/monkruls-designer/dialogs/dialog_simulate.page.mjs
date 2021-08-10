/**
 * Returns the page to display for the object dialog.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import {util} from "/framework/js/util.mjs";
import {monkrulsmodel} from "../model/monkrulsmodel.mjs";

const MODULE_PATH = util.getModulePath(import.meta), TEST_OBJECT_IMG = `${MODULE_PATH}/object.svg`;

function getPage(viewPath, dialogProperties={allTestObjects: "[]", doTestWithObjects: "[]"}) {
    if (!dialogProperties.allTestObjects) dialogProperties.allTestObjects = "[]";
    if (!dialogProperties.doTestWithObjects) dialogProperties.doTestWithObjects = "[]";

    const allTestObjects = JSON.parse(dialogProperties.allTestObjects), doTestWithObjects = JSON.parse(dialogProperties.doTestWithObjects);
    const savedIDs = {allTestObjects:[], doTestWithObjects:[]};
    for (const dnditem of allTestObjects) savedIDs.allTestObjects.push(dnditem.id);
    for (const dnditem of doTestWithObjects) savedIDs.doTestWithObjects.push(dnditem.id);
    const result = _fillObjectsForDragDropLists(savedIDs);
    dialogProperties.allTestObjects = result.allTestObjects; dialogProperties.doTestWithObjects = result.doTestWithObjects;
    return {page: `${viewPath}/dialogs/dialog_simulate.page`, dialogProperties};
}

function _fillObjectsForDragDropLists(savedIDs) {
    const model = JSON.parse(monkrulsmodel.getModelAsFile().data);
    const result = {allTestObjects:[], doTestWithObjects: []}; for (const object of model.objects) {
        const dndObject = {id: object.id, img: TEST_OBJECT_IMG, label: object.description};
        if (savedIDs.allTestObjects.includes(dndObject.id)) result.allTestObjects.push(dndObject);
        else if (savedIDs.doTestWithObjects.includes(object.id)) result.doTestWithObjects.push(dndObject);
        else result.allTestObjects.push(dndObject);
    }; 
    return {allTestObjects: JSON.stringify(result.allTestObjects), doTestWithObjects: JSON.stringify(result.doTestWithObjects)};
}

export const page = {getPage};