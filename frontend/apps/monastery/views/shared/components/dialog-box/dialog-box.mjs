/**
 * A dialog box Monkshu web component. 
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {router} from "/framework/js/router.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const DEFAULT_HOST_ID = "__org_monkshu_dialog_box", COMPONENT_PATH = util.getModulePath(import.meta);
const DEFAULT_THEME = {showOKIcon: true, showCancelIcon: true, showOKButton: true, showCancelButton: true};
let _pendingRenderResolves;

/**
 * Shows the dialog box
 * @param themeOrThemePath The theme path or theme data as a JSON Object
 * @param templateOrTemplateURL The HTML template path as a URL object, or a string that contains HTML
 * @param templateData Data to pass to expand the template
 * @param retValIDs The IDs of elements (inside the template) whose value should be returned when dialog is closed
 * @param callback Callback method when dialog is closed via an OK or cancel. Returns -> "cancel"||"submit", retVals, element
 *                 For submit, the dialog is kept open, and hide dialog must be called manually. For cancel, it is closed automatically.
 *                 retVals is the return values for all elements whose ID was given in retValIDs.
 *                 element is the element inside the dialog content, which caused this event.
 * @param hostID Optional: The ID to host the custom component inside the main HTML, only needed if default ID clashes
 */
async function showDialog(themeOrThemePath, templateOrTemplateURL, templateData, retValIDs, callback, hostID=DEFAULT_HOST_ID) {
    await _initDialogFramework(hostID); 
    await dialog_box.bindData(await _processTheme((typeof themeOrThemePath == "string" || themeOrThemePath instanceof URL) ?
        await $$.requireJSON(themeOrThemePath) : themeOrThemePath||DEFAULT_THEME), hostID );   // bind the theme data

    const shadowRoot = dialog_box.getShadowRootByHostId(hostID); _resetUI(shadowRoot);
    const templateHTML = typeof templateOrTemplateURL == "string" ? (templateData ? await router.expandPageData(
        templateOrTemplateURL, undefined, templateData) : templateOrTemplateURL) : await router.loadHTML(templateOrTemplateURL, templateData, false);
    const templateRoot = new DOMParser().parseFromString(templateHTML, "text/html").documentElement;
    router.runShadowJSScripts(templateRoot, shadowRoot);
    shadowRoot.querySelector("div#dialogcontent").appendChild(templateRoot);    // add dialog content

    const memory = dialog_box.getMemory(hostID); memory.retValIDs = retValIDs; memory.callback = callback; 
    document.querySelector(`#${hostID}`).style.display = "block";   // show the dialog
    // for some reason this otherwise adds in a visible block if the <!doctype HTML> is declared in the parent document, and transitions don't work if this is defined in HTML file 
    shadowRoot.querySelector("html").style.height = "0px";  shadowRoot.querySelector("html").style.width = "0px"; 
    document.querySelector(`#${hostID}`).style.height = "0px"; document.querySelector(`#${hostID}`).style.width = "0px";
}

/**
 * Shows an info, error or any other message to the user
 * @param message The message to show
 * @param type Optional: Should be one of the following - "info", "error", "warning", Default is "info"
 * @param callback Optional: Callback to call when user dismisses the dialog
 * @param icon Optional: The icon to display along with the message
 * @param okLabel Optional: Label for the OK button
 * @param hostID Optional: The hostID to use for the dialog
 */
function showMessage(message, type="info", callback, icon, okLabel, hostID) {
    const theme = {showOKIcon: false, showCancelIcon: false, showCancelButton: false, showOKButton: true, okLabel};
    showDialog(theme, new URL(`${COMPONENT_PATH}/templates/message.html`), {message, 
        icon: icon||`${COMPONENT_PATH}/img/${type}.svg`}, [], callback, hostID);
}

/**
 * Shows an selection box prompt
 * @param message The message to show and choices. Object. Format {message: string, choices:[array of choices as strings]}
 * @param callback Callback to call when user dismisses the dialog, contains the selected choice or null if it was cancelled
 * @param okLabel Optional: Label for the OK button
 * @param cancelLabel Optional: Label for the cancel button
 * @param hostID Optional: The hostID to use for the dialog
 */
 function showChoice(message, callback, okLabel, cancelLabel, hostID) {
    const theme = {showOKIcon: false, showCancelIcon: false, showCancelButton: true, showOKButton: true, okLabel, cancelLabel};
    showDialog(theme, new URL(`${COMPONENT_PATH}/templates/choice.html`), message, ["choice"], (result, retVals)=>{
        if (result=="cancel")callback(null); else callback(retVals.choice)}, hostID);
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
 * Submits the dialog and calls the callback in showDialog. If callback returns false the dialog will stay 
 * open (to show errors and resubmit).
 * @param element The element inside the dialog or ID of the dialog host element (if custom hostID was used in showDialog), else null
 * @returns The values of elements whose IDs were passed as retValIDs in showDialog function
 */
 function submit(element) {
    const memory = dialog_box.getMemoryByContainedElement(element);
    const retVals = _getRetVals(memory, dialog_box.getShadowRootByContainedElement(element));
    if (memory.callback?.("submit", retVals, element)) hideDialog(element);
} 

 /**
  * Shows the given error message on the dialog
  * @param element The element inside the dialog or ID of the dialog host element (if custom hostID was used in showDialog), else null
  * @param msg The error message
  */
function error(element, msg) {
    const shadowRoot = element instanceof Element ? dialog_box.getShadowRootByContainedElement(element): 
        dialog_box.getShadowRootByHostId(element);
    const divError = shadowRoot.querySelector("div#error"); if (!divError) return;
    divError.innerHTML = msg; divError.style.visibility = "visible";
}

/**
 * Hides the error
 * @param element The element inside the dialog or ID of the dialog host element (if custom hostID was used in showDialog), else null
 */
function hideError(element) {
    const shadowRoot = dialog_box.getShadowRootByContainedElement(element);
    const divError = shadowRoot.querySelector("div#error"); if (!divError) return;
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
    const divError = shadowRoot.querySelector("div#error"); if (divError) divError.style.visibility = "hidden";
    if (shadowRoot.querySelector("span#ok")) shadowRoot.querySelector("span#ok").style.display = "inline";
    if (shadowRoot.querySelector("span#cancel")) shadowRoot.querySelector("span#cancel").style.display = "inline";
}

async function _processTheme(theme) {
    const clone = JSON.parse(await router.expandPageData(JSON.stringify(theme)));
    const cssVars = [];
    for (const key in theme) if (key.startsWith("var--")) cssVars.push(`${key.substring(3)}: ${theme[key]}`);
    if (cssVars.length || theme.styleBody)
        clone.styleBody = `<style>${(theme.styleBody||"")+"\n"}:host{${cssVars.join("; ")}}</style>`;
    clone.componentPath = util.getModulePath(import.meta);
    if (theme.showOKIcon) clone.showOKIcon = true; else delete clone.showOKIcon;
    if (theme.showCancelIcon) clone.showCancelIcon = true; else delete clone.showCancelIcon;
    if (theme.showOKButton) clone.showOKButton = true; else delete clone.showOKButton;
    if (theme.showCancelButton) clone.showCancelButton = true; else delete clone.showCancelButton;
    return clone;
}

export const dialog_box = {showDialog, trueWebComponentMode: true, hideDialog, error, hideError, 
    submit, cancel, elementRendered, showMessage, showChoice}
monkshu_component.register("dialog-box", `${util.getModulePath(import.meta)}/dialog-box.html`, dialog_box);