/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { jsonview } from "./src/json-view.js";

const COMPONENT_PATH = util.getModulePath(import.meta);



async function elementRendered(element) {

  const shadowRoot = apiinput_apioutput.getShadowRootByHostId(element.getAttribute("id"));
  console.log(shadowRoot);
  const inputdata = {
    "givenName": "Vas",
    "surName": "Sudanagunta",
    "children": [
      {
        "givenName": "Natalia",
        "age": 5
      },
      {
        "givenName": "Aida",
        "age": 17
      }
    ],
    "address": {
      "state": "NY",
      "city": "Brooklyn",
      "street": "718 Marcus Garvey Ave"
    }
  }
  const outputdata= {
    "name": "String",
    "age": "Integer",
    "location": {
      "city": "String",
      "state": "String",
      "pin": "Integer",
      "order": [
        {
          "item": "String",
          "code": "Integer"
        }
      ]
    }
   
  }

  const tree = jsonview.create(inputdata);
  jsonview.render(tree, shadowRoot.querySelector('.input-root'));
  jsonview.expand(tree);

  const tree2 = jsonview.create(outputdata);
  jsonview.render(tree2,shadowRoot.querySelector('.output-root'));
  jsonview.expand(tree2);

}

export const apiinput_apioutput = {
  trueWebComponentMode: false, elementRendered
}

monkshu_component.register(
  "apiinput-apioutput", `${COMPONENT_PATH}/apiinput-apioutput.html`, apiinput_apioutput
);