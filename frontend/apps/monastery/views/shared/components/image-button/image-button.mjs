/** 
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);

const elementConnected = async element => {
    const data = {img: element.getAttribute("img"), text: element.getAttribute("text"), 
		onclick: element.getAttribute("onclickHandler"), alt: element.getAttribute("alt"), title: element.getAttribute("title"),
		styleBody: element.getAttribute("styleBody")?`<style>${element.getAttribute("styleBody")}</style>`:undefined,
		column: element.getAttribute("type")=="column"?true:undefined, row: element.getAttribute("type")=="row"?true:undefined,
		color: element.getAttribute("color"), "background-color": element.getAttribute("background-color"), 
		"active-background-color": element.getAttribute("active-background-color"), border: element.getAttribute("border")
	};

	image_button.setData(element.id, data);
}

// convert this all into a WebComponent so we can use it
export const image_button = {trueWebComponentMode: true, elementConnected}
monkshu_component.register("image-button", `${COMPONENT_PATH}/image-button.html`, image_button);