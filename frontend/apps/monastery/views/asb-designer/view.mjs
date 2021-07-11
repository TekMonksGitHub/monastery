/** 
 * ASB designer's main view
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {flowuiView} from "../shared/views/flowuiView.mjs";

const init = async _ => flowuiView.init(util.getModulePath(import.meta));

export const view = {...flowuiView, init};