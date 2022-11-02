/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 import { util } from "/framework/js/util.mjs";
 import { monkshu_component } from "/framework/js/monkshu_component.mjs";
 
 const COMPONENT_PATH = util.getModulePath(import.meta);

 const elementConnected = async (element) => {
    const data = {componentPath: COMPONENT_PATH, styleBody:element.getAttribute("styleBody")?
    `<style>${element.getAttribute("styleBody")}</style>`:undefined};
    console.log(element);
    api_details.setData(element.id, data);
 }

 async function elementRendered(element) {
   /* const host =api_details .getHostElement(element);
    const accordion = api_details.getShadowRootByHost(host).querySelector('container-header');
    for (let i=0; i<accordion.length; i++) {
        accordion[i].addEventListener('click', function () {
          this.classList.toggle('active')
        })
      }*/
      const shadowRoot = api_details.getShadowRootByHostId(element.getAttribute("id"));
      console.log(shadowRoot);
      const accordion = shadowRoot.querySelectorAll("div.container-header");
      for (let i=0; i<accordion.length; i++) {
        accordion[i].addEventListener('click', function () {
          this.classList.toggle('active')
        })
       }
    }

export const api_details = {
    trueWebComponentMode: true,elementConnected,elementRendered
}

monkshu_component.register(
    "api-details", `${COMPONENT_PATH}/api-details.html`, api_details
);