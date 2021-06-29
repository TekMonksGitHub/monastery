/**
 * A dialog box Monkshu web component. 
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {router} from "/framework/js/router.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const DEFAULT_HOST_ID = "__org_monkshu_dialog_box";
let _pendingRenderResolves;

/**
 * Shows the dialog box
 * @param themePath The theme path
 * @param templatePath The HTML template path as a URL class, or a string that contains HTML
 * @param templateData Data to pass to expand the template, if the incoming template path is a URL
 * @param retValIDs The IDs of elements (inside the template) whose value should be returned when dialog is closed
 * @param callback Callback method when dialog is closed via an OK or cancel. Returns -> "cancel"||"submit", retVals, element
 *                 For submit, the dialog is kept open, and hide dialog must be called manually. For cancel, it is closed automatically.
 *                 retVals is the return values for all elements whose ID was given in retValIDs.
 *                 element is the element inside the dialog content, which caused this event.
 * @param hostID Optional: The ID to host the custom component inside the main HTML, only needed if default ID clashes
 */
async function showDialog(themePath, templatePath, templateData, retValIDs, callback, hostID=DEFAULT_HOST_ID) {
    await _initDialogFramework(hostID); 
    if (themePath) await dialog_box.bindData(_processTheme(await $$.requireJSON(themePath)), hostID);    // bind the theme data

    const shadowRoot = dialog_box.getShadowRootByHostId(hostID); _resetUI(shadowRoot);
    const templateHTML = typeof templatePath == "string" ? templatePath : await router.loadHTML(templatePath, templateData, false);
    const templateRoot = new DOMParser().parseFromString(templateHTML, "text/html").documentElement;
    router.runShadowJSScripts(templateRoot, shadowRoot);
    shadowRoot.querySelector("div#dialogcontent").appendChild(templateRoot);    // add dialog content

    const memory = dialog_box.getMemory(hostID); memory.retValIDs = retValIDs; memory.callback = callback; 
    document.querySelector(`#${hostID}`).style.display = "block";   // show the dialog
}

/**
 * Cancels the dialog, will close the dialog automatically as well.
 * @param element The element inside the dialog or ID of the dialog host element (if custom hostID was used in showDialog), else null
 */
function cancel(element) {
    const memory = dialog_box.getMemoryByContainedElement(element);
    const retVals = _getRetVals(memory, dialog_box.getShadowRootByContainedElement(element));
    hideDialog(element); memory.callback?.("cancel", retVals, element);
}

/**
 * Hides the dialog
 * @param element The element inside the dialog or ID of the dialog host element (if custom hostID was used in showDialog), else null
 */
function hideDialog(element) {
    const shadowRoot = element instanceof Element ? dialog_box.getShadowRootByContainedElement(element): 
        dialog_box.getShadowRootByHostId(element||DEFAULT_HOST_ID);
    const hostElement = shadowRoot.querySelector("div#dialogcontent");
    while (hostElement && hostElement.firstChild) hostElement.removeChild(hostElement.firstChild);  // deletes everything
    dialog_box.getHostElement(hostElement).style.display = "none"; // hide the dialog itself
 }

/**
 * Submits the dialog and calls the callback in showDialog. It will NOT close the dialog, as submission may result
 * in errors which need to be shown to the user, to allow him to correct his input.
 * @param element The element inside the dialog or ID of the dialog host element (if custom hostID was used in showDialog), else null
 * @returns The values of elements whose IDs were passed as retValIDs in showDialog function
 */
 function submit(element) {
    const memory = dialog_box.getMemoryByContainedElement(element);
    const retVals = _getRetVals(memory, dialog_box.getShadowRootByContainedElement(element));
    memory.callback?.("submit", retVals, element);
} 

 /**
  * Shows the given error message on the dialog
  * @param element The element inside the dialog or ID of the dialog host element (if custom hostID was used in showDialog), else null
  * @param msg The error message
  */
function error(element, msg) {
    const shadowRoot = element instanceof Element ? dialog_box.getShadowRootByContainedElement(element): 
        dialog_box.getShadowRootByHostId(element);
    const divError = shadowRoot.querySelector("div#error");
    divError.innerHTML = msg; divError.style.visibility = "visible";
}

/**
 * Hides the error
 * @param element The element inside the dialog or ID of the dialog host element (if custom hostID was used in showDialog), else null
 */
function hideError(element) {
    const shadowRoot = dialog_box.getShadowRootByContainedElement(element);
    const divError = shadowRoot.querySelector("div#error");
    divError.style.visibility = "hidden";
}

function _getRetVals(memory, shadowRoot) {
    const ret = {};
    if (memory.retValIDs) for (const retValId of memory.retValIDs) 
        ret[retValId] = shadowRoot.querySelector(`#${retValId}`)?shadowRoot.querySelector(`#${retValId}`).value:null;
    return ret;
}

function elementRendered(_) {
    if (_pendingRenderResolves) {
        _pendingRenderResolves(); _pendingRenderResolves = null;
    }
}

function _initDialogFramework(hostID) {
    if (document.querySelector(`#${hostID}`)) return; // already exists in the document

    const dialogWebComponent = document.createElement("dialog-box"); dialogWebComponent.id=hostID; 
    dialogWebComponent.style.display = "none"; document.body.appendChild(dialogWebComponent);
    return new Promise(resolve => _pendingRenderResolves = resolve);
} 

function _resetUI(shadowRoot) {
    shadowRoot.querySelector("div#error").style.visibility = "hidden";
    if (shadowRoot.querySelector("span#ok")) shadowRoot.querySelector("span#ok").style.display = "inline";
    if (shadowRoot.querySelector("span#cancel")) shadowRoot.querySelector("span#cancel").style.display = "inline";
}

function _processTheme(theme) {
    const clone = {...theme};
    const cssVars = [];
    for (const key in theme) if (key.startsWith("var--")) cssVars.push(`${key.substring(3)}: ${theme[key]}`);
    if (cssVars.length || theme.styleBody)
        clone.styleBody = `<style>${(theme.styleBody||"")+"\n"}:host{${cssVars.join("; ")}}</style>`;
    clone.componentPath = util.getModulePath(import.meta);
    if (theme.showOKIcon) clone.showOKIcon = true; else delete clone.showOKIcon;
    if (theme.showCancelIcon) clone.showCancelIcon = true; else delete clone.showCancelIcon;
    return clone;
}

export const dialog_box = {showDialog, trueWebComponentMode: true, hideDialog, error, hideError, submit, cancel, elementRendered}
monkshu_component.register("dialog-box", `${util.getModulePath(import.meta)}/dialog-box.html`, dialog_box);