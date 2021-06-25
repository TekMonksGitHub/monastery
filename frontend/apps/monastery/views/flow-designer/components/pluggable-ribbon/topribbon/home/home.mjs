/* 
 * (C) 2020 TekMonks. All rights reserved.
 */

let DIAG_ELEMENT_ID, PLUGIN_PATH, SVG_DATA, IMAGE, I18N, MENU_DIV;

async function init(pluginData, pluginPath) {
    DIAG_ELEMENT_ID = pluginData["graphID"]; PLUGIN_PATH = pluginPath;
    const svgSource64 = btoa(await (await fetch(`${pluginPath}/home.svg`)).text());
    SVG_DATA = "data:image/svg+xml," + svgSource64; IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${pluginPath}/home.i18n.mjs`)).i18n; 
    return true;
}

async function clicked(element) {
    MENU_DIV = MENU_DIV || [..._htmlToNodes(await (await fetch(`${PLUGIN_PATH}/home.html`)).text())];
    for (const node of MENU_DIV) element.parentNode.parentNode.appendChild(node);
    const closer = event => {
        if (event.pageX > 300 || event.pageY > 200 || event.pageX < 50 || event.pageY < 40) {
            for (const node of MENU_DIV) try{element.parentNode.parentNode.removeChild(node);} catch(err) {}
            document.removeEventListener("click", closer);
        }
    }
    document.addEventListener("click", closer);
}

const getImage = _ => IMAGE;

const getHelpText = (lang=en) => I18N.HELP_TEXTS[lang];

function _htmlToNodes(html) {
    const template = document.createElement('template'); template.innerHTML = html.trim();
    return template.content.childNodes;
}

export const home = {init, clicked, getImage, getHelpText}
