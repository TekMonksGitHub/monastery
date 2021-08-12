/**
 * Returns the page to display for the data dialog.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import {i18n} from "/framework/js/i18n.mjs";

function getPage(viewPath, dialogProperties) {
    if (dialogProperties?.type == "JSON/Javascript") return {page: `${viewPath}/dialogs/dialog_data.code.page`, dialogProperties};
    if (dialogProperties?.type == "CSV") return {page: `${viewPath}/dialogs/dialog_data.sheet.page`, dialogProperties};
    
    return new Promise(async resolve => {
        window.monkshu_env.components["dialog-box"].showChoice( {message: await i18n.get("PickOption"), choices:["JSON/Javascript", "CSV"]}, 
            option => { if (option) resolve({page: `${viewPath}/dialogs/dialog_data.${option=="CSV"?"sheet":"code"}.page`, dialogProperties});
                else resolve(); } );
    });
}

export const page = {getPage};