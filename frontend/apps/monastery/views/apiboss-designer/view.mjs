/** 
 * Monkruls designer's main view
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {flowuiView} from "../shared/views/flowuiView.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";

const API_KEYS = {"*":"fheiwu98237hjief8923ydewjidw834284hwqdnejwr79389"}, KEY_HEADER = "X-API-Key";

async function init() {
    await flowuiView.init(util.getModulePath(import.meta));
    apiman.registerAPIKeys(API_KEYS, KEY_HEADER);
}

export const view = {...flowuiView, init};