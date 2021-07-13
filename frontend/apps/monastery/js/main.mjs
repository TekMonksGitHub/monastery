/**
 * For main.html file.
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {blackboard} from "/framework/js/blackboard.mjs"; 

async function init(viewURL) {
    window.monkshu_env.frameworklibs.blackboard = blackboard;

    const view = (await import(`${viewURL}/view.mjs`)).view; await view.init(); 

    // doing this here instead of adding pageGenerator directly to the HTML ensures any i18n or 
    // other changes that the view page needs, are incorporated into the application before 
    // the pageGenerator runs as we await view.init() in the previous line.
    import ("/framework/components/page-generator/page-generator.mjs");
    const pageGenerator = document.createElement("page-generator"); 
    pageGenerator.setAttribute("file", `${viewURL}/page/view.page`);
    document.body.appendChild(pageGenerator);
}

export const main = {init};