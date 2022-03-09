import {monkshu_component} from "/framework/js/monkshu_component.mjs";
import {util} from "/framework/js/util.mjs";


const COMPONENT_PATH = util.getModulePath(import.meta);

const elementConnected = async element => {

  
  
Object.defineProperty(element, "value", {get: _=>_getValue(element), set: value=>_setValue(value, element)});
   const data = { 
    styleBody: element.getAttribute("styleBody")?`<style>${element.getAttribute("styleBody")}</style>`:undefined, 
    html:element.getAttribute("htmlTemplate")
  };
  if(true){

  }
  
  list_box.setData(element.id, data); 
  }


  async function elementRendered(element) {
    
   list_box.getMemoryByHost(element).editor = list_box; 

   console.log(list_box.getMemoryByHost(element).editor); 
   console.log(list_box.shadowRoots.listbox.innerHTML)
   //  _setHTML(element.getAttribute("value"), element);
  //  console.log(list_box);
  // const shadowRoot = list_box.getShadowRootByHost(
  //   element
  // );
  // console.log(shadowRoot);
  // console.log(shadowRoot.innerHTML);
    
  }
  function _getHTML(host) {
   
    // const cm = list_box.getMemoryByHost(host);
  
    
  }
  
  function _setHTML(value, host) {
    
    const cm = list_box.getMemoryByHost(host);
  //  // cm.getDoc().setValue(value);
  }  

  function _getValue(host) {
    const activeTextBoxValue = _getTextBoxes(host.id);
    
  }
  function _getTextBoxes(hostID, dontTrim) {
    console.log("hostID");
    console.log(hostID);
    const shadowRoot = spread_sheet.getShadowRootByHostId(hostID), rows = shadowRoot.querySelectorAll("input");
    const textBoxObject = []; for (const row of rows) {
      const rowData = Array.prototype.slice.call(row.getElementsByTagName("textarea")).map(e => e.value);
      if (_isEmptyArray(rowData) && !dontTrim) continue;	// skip totally empty rows, unless don't trim was specified.
      else textBoxObject.push(rowData);
    }

    return csv;
  }
export const list_box = {trueWebComponentMode: false,elementConnected,elementRendered};

monkshu_component.register("list-box", `${COMPONENT_PATH}/list-box.html`, list_box);