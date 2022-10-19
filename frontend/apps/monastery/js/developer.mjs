/**
 * For home.html file.
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */



async function init(viewURL) {
 
    // doing this here instead of adding pageGenerator directly to the HTML ensures any i18n or 
    // other changes that the view page needs, are incorporated into the application before 
    // the pageGenerator runs as we await view.init() in the previous line.
    await import ("/framework/components/page-generator/page-generator.mjs");
    const pageGenerator = document.createElement("page-generator"); 
    pageGenerator.setAttribute("file", `${viewURL}/page/developer.page`);
    document.body.appendChild(pageGenerator);
}


export const developer = {init}
