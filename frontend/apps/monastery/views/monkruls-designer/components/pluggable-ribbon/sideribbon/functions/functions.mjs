/** 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {newFlowNode} from "../../lib/flowNode.mjs";

const parentNode = newFlowNode();
const init = async _ => {await parentNode.init("functions", util.getModulePath(import.meta), false); return true;}
export const functions = {init, ...parentNode};