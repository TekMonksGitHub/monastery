/** 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {newFlowNode} from "../../lib/flowNode.mjs";

const thisNode = newFlowNode();

const init = async _ => {await thisNode.init("fileListener", util.getModulePath(import.meta)); return true;}

const parentExports = {...thisNode}; delete parentExports["init"];
export const fileListener = {init, ...parentExports};
