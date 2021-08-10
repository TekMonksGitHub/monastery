/** 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {newRibbonButton} from "../../lib/ribbonButton.mjs";
import {simulate as simulateModule} from "../../../../js/simulate.mjs";

const parentNode = newRibbonButton();
const init = async _ => { await parentNode.init("simulate", util.getModulePath(import.meta),  
    {click: _=>simulateModule.open()}); return true; }
export const simulate = {init, ...parentNode};