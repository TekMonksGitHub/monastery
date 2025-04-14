/** 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {newRibbonButton} from "../../lib/ribbonButton.mjs";
import {unpublish as unPublishModule} from "../../../../js/unpublish.mjs"

const MODULE_PATH = util.getModulePath(import.meta);

const parentNode = newRibbonButton();
const init = async _ => { await parentNode.init("unpublish", MODULE_PATH,  {click: _=>unPublishModule.openDialog()}); return true; }
    
export const unpublish = {init, ...parentNode};