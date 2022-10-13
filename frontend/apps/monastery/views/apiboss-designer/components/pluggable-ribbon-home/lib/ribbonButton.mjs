/**
 * Base module for ribbon buttons inside pluggable ribbon 
 * (C) 2020 TekMonks. All rights reserved.
 */

class RibbonButton {
    PLUGIN_PATH; I18N; SHAPE_NAME; IMAGE; CURSOR; CLICKED_FUNCTION;

    async init(pluginName, pluginPath, functions, cursor="default") {
        this.SHAPE_NAME = pluginName; this.PLUGIN_PATH = pluginPath; 
        this.I18N = (await import(`${pluginPath}/${pluginName}.i18n.mjs`)).i18n; 
        this.CURSOR = cursor;

        if (functions.click) this.CLICKED_FUNCTION = functions.click;
        
        const svgSource64 = btoa(await (await fetch(`${pluginPath}/${pluginName}.svg`)).text());
        this.IMAGE = "data:image/svg+xml;base64," + svgSource64;
    }

    clicked = _ => this.#clicked();

    getImage = _ => this.IMAGE;
    
    getHelpText = (lang=en) => this.I18N.HELP_TEXTS[lang];

    getDescriptiveName = (lang=en) => this.I18N.DESCRIPTIVE_NAME[lang];

    geti18n = _ => this.I18N;

    getCursor = _ => this.CURSOR;

    // Private Members    
    #clicked() {
        if (this.CLICKED_FUNCTION) this.CLICKED_FUNCTION(); else LOG.info(`${this.SHAPE_NAME} clicked`);
    }
}

export const newRibbonButton = _ => new RibbonButton();