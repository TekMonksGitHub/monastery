/** 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {newRibbonButton} from "../../lib/ribbonButton.mjs";
import {publish as publishMod} from "../../../../js/publish.mjs"

const MODULE_PATH = util.getModulePath(import.meta);

const parentNode = newRibbonButton();
const init = async _ => { await parentNode.init("publish", MODULE_PATH,  {click: _=>publishMod.openDialog()}); return true; }
    
export const publish = {init, ...parentNode};