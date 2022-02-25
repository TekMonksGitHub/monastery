/**
 * Returns the page to display for the object dialog.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import {i18n} from "/framework/js/i18n.mjs";

async function getPage(viewPath, dialogProperties) {
    if (dialogProperties?.type == "JSON/Javascript") return {page: `${viewPath}/dialogs/dialog_object.code.page`, dialogProperties};
    if (dialogProperties?.type == "CSV") return {page: `${viewPath}/dialogs/dialog_object.sheet.page`, dialogProperties};
    
    const theme = await $$.requireJSON(`${viewPath}/dialogs/dialogPropertiesPrompt.json`)

    return new Promise(async resolve => {
        window.monkshu_env.components["dialog-box"].showChoice( {message: await i18n.get("PickOption"), choices:["JSON/Javascript", "CSV"]}, 
            option => { if (option) resolve({page: `${viewPath}/dialogs/dialog_object.${option=="CSV"?"sheet":"code"}.page`, dialogProperties});
                else resolve(); }, theme );
    });
}

export const page = {getPage};