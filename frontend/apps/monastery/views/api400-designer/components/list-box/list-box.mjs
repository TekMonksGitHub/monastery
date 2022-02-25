import {monkshu_component} from "/framework/js/monkshu_component.mjs";
import {util} from "/framework/js/util.mjs";


const COMPONENT_PATH = util.getModulePath(import.meta);

const elementConnected = async element => {
    const data = { 
    styleBody: element.getAttribute("styleBody")?`<style>${element.getAttribute("styleBody")}</style>`:undefined, 
  };
  list_box.setData(element.id, data); 
  }
export const list_box = {trueWebComponentMode: false,elementConnected};

monkshu_component.register("list-box", `${COMPONENT_PATH}/list-box.html`, list_box);