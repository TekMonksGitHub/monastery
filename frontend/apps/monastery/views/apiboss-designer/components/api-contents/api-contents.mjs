/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 import { util } from "/framework/js/util.mjs";
 import { monkshu_component } from "/framework/js/monkshu_component.mjs";
 
 const COMPONENT_PATH = util.getModulePath(import.meta);

 let model = {
    "apis": [
        {
            "description": "Bill Of Lading",
            "nodeName": "api",
            "name": "Api1",
            "id": "167100034350183.1718773181056",
            "x": 210,
            "y": 50,
            "dependencies": [
                "167100035268611.011567976397195"
            ],
            "apiname": "Bill Of Lading",
            "apidescription": "Bill of lading is a POST request  and accepts JSON for request payload.",
            "exposedpath": "/tracking/bol",
            "method": "POST",
            "backendurl": "http://10.56.2.141:3800/bol",
            "method1": "POST",
            "injected": "[[\"Authorization\",\"Bearer << JWT >>\"]]",
            "passthrough": "[[\"k\"],[\"l\"]]",
            "yesorno": "YES",
            "contentinput": "appication/json",
            "input-output": "{\n  \"requestBody\": {\n    \"content\": {\n      \"application/json\": {\n        \"schema\": {\n          \"type\": \"object\",\n          \"properties\": {\n            \"ORGZIP\": {\n              \"type\": \"integer\",\n              \"desc\": \"Origin Pincode\"\n            },\n            \"DESTZIP\": {\n              \"type\": \"integer\",\n              \"desc\": \"Destination Pincode\"\n            },\n            \"DATE\": {\n              \"type\": \"string\",\n              \"desc\": \"Date of Purchase\"\n            },\n            \"OPTIONS\": {\n              \"type\": \"string\",\n              \"desc\": \"Some Options\"\n            },\n            \"SHIPMENT\": {\n              \"type\": \"array\",\n              \"desc\": \"Shipment Info\",\n              \"items\": {\n                \"type\": \"object\",\n                \"properties\": {\n                  \"PIECES\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Total ordered pieces\"\n                  },\n                  \"CLASS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Class of shipment service\"\n                  },\n                  \"UOM\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Some UOM\"\n                  },\n                  \"QUANTITY\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Total Quantity of product\"\n                  },\n                  \"WEIGHT\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Weight of order\"\n                  },\n                  \"FLAGS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Some Country Flag\"\n                  }\n                }\n              }\n            }\n          },\n          \"required\": [\n            \"ORGZIP\",\n            \"DESTZIP\"\n          ]\n        }\n      }\n    }\n  },\n  \"responses\": {\n    \"200\": {\n      \"description\": \"response\",\n      \"content\": {\n        \"application/json\": {\n          \"schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n              \"result\": {\n                \"type\": \"boolean\",\n                \"desc\": \"true / false\"\n              },\n              \"CUSTOMER\": {\n                \"type\": \"object\",\n                \"desc\": \"Customer Details\",\n                \"properties\": {\n                  \"NAME\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Name of the customer\"\n                  },\n                  \"ADDRESS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Address of the customer\"\n                  },\n                  \"QUOTENUM\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Quotation number of the customer\"\n                  }\n                }\n              },\n              \"DESTINATION\": {\n                \"type\": \"object\",\n                \"desc\": \"Destination Details\",\n                \"properties\": {\n                  \"ORGZIP\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Origin Pincode\"\n                  },\n                  \"ENDZIP\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Delivery Pincode\"\n                  },\n                  \"CITYSTATE\": {\n                    \"type\": \"string\",\n                    \"desc\": \"City and State of the destination\"\n                  },\n                  \"FUELMSG\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Fuel message that spent on the delivery\"\n                  },\n                  \"FUELCHRG\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Total Fuel Charges\"\n                  },\n                  \"TOTALAMOUNT\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Total Amount Spent in the Shipment\"\n                  }\n                }\n              },\n              \"SHIPMENT\": {\n                \"type\": \"array\",\n                \"desc\": \"Shipment Details\",\n                \"items\": {\n                  \"type\": \"object\",\n                  \"properties\": {\n                    \"PIECES\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total number of pieces\"\n                    },\n                    \"CODE\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some Code\"\n                    },\n                    \"CLASS\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Shipment Class\"\n                    },\n                    \"DESCRIPTION\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Shipment description\"\n                    },\n                    \"UOM\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some UOM\"\n                    },\n                    \"QUANTITY\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total Quantity\"\n                    },\n                    \"WEIGHT\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total Weight\"\n                    },\n                    \"FLAGS\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some Country Flag\"\n                    },\n                    \"RATE\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Rate per mile\"\n                    },\n                    \"AMOUNT\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total cost of shipment\"\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}"
        },
        {
            "description": "Request Quote",
            "nodeName": "api",
            "name": "Api2",
            "id": "167100034590431.975116328701425",
            "x": 320,
            "y": 70,
            "dependencies": [
                "167100035650130.945507963243625"
            ],
            "apiname": "Request Quote",
            "apidescription": "Requesting the quotation",
            "exposedpath":  "/partner/requestquote",
            "method": "POST",
            "backendurl": "http://10.56.2.141:3800/requestquote",
            "method1": "POST", 
            "injected": "[[\"Authorization\",\"Bearer << JWT >>\"]]",
            "passthrough": "[[\"asdsa\"],[\"fas\"]]",
            "yesorno": "NO",
            "contentinput": "application/json",
            "input-output":
             "\"{\\n  \\\"requestBody\\\": {\\n    \\\"content\\\": {\\n      \\\"application/json\\\": {\\n        \\\"schema\\\": {\\n          \\\"type\\\": \\\"object\\\",\\n          \\\"properties\\\": {\\n            \\\"ORGZIP\\\": {\\n              \\\"type\\\": \\\"integer\\\",\\n              \\\"desc\\\": \\\"Origin Pincode\\\"\\n            },\\n            \\\"DESTZIP\\\": {\\n              \\\"type\\\": \\\"integer\\\",\\n              \\\"desc\\\": \\\"Destination Pincode\\\"\\n            },\\n            \\\"DATE\\\": {\\n              \\\"type\\\": \\\"string\\\",\\n              \\\"desc\\\": \\\"Date of Purchase\\\"\\n            },\\n            \\\"OPTIONS\\\": {\\n              \\\"type\\\": \\\"string\\\",\\n              \\\"desc\\\": \\\"Some Options\\\"\\n            },\\n            \\\"SHIPMENT\\\": {\\n              \\\"type\\\": \\\"array\\\",\\n              \\\"desc\\\": \\\"Shipment Info\\\",\\n              \\\"items\\\": {\\n                \\\"type\\\": \\\"object\\\",\\n                \\\"properties\\\": {\\n                  \\\"PIECES\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Total ordered pieces\\\"\\n                  },\\n                  \\\"CLASS\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Class of shipment service\\\"\\n                  },\\n                  \\\"UOM\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Some UOM\\\"\\n                  },\\n                  \\\"QUANTITY\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Total Quantity of product\\\"\\n                  },\\n                  \\\"WEIGHT\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Weight of order\\\"\\n                  },\\n                  \\\"FLAGS\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Some Country Flag\\\"\\n                  }\\n                }\\n              }\\n            }\\n          },\\n          \\\"required\\\": [\\n            \\\"ORGZIP\\\",\\n            \\\"DESTZIP\\\"\\n          ]\\n        }\\n      }\\n    }\\n  },\\n  \\\"responses\\\": {\\n    \\\"200\\\": {\\n      \\\"description\\\": \\\"response\\\",\\n      \\\"content\\\": {\\n        \\\"application/json\\\": {\\n          \\\"schema\\\": {\\n            \\\"type\\\": \\\"object\\\",\\n            \\\"properties\\\": {\\n              \\\"result\\\": {\\n                \\\"type\\\": \\\"boolean\\\"\\n              },\\n              \\\"CUSTOMER\\\": {\\n                \\\"type\\\": \\\"object\\\",\\n                \\\"desc\\\": \\\"Customer Details\\\",\\n                \\\"properties\\\": {\\n                  \\\"NAME\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Name of the customer\\\"\\n                  },\\n                  \\\"ADDRESS\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Address of the customer\\\"\\n                  },\\n                  \\\"QUOTENUM\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Quotation number of the customer\\\"\\n                  }\\n                }\\n              },\\n              \\\"DESTINATION\\\": {\\n                \\\"type\\\": \\\"object\\\",\\n                \\\"desc\\\": \\\"Destination Details\\\",\\n                \\\"properties\\\": {\\n                  \\\"ORGZIP\\\": {\\n                    \\\"type\\\": \\\"integer\\\",\\n                    \\\"desc\\\": \\\"Origin Pincode\\\"\\n                  },\\n                  \\\"ENDZIP\\\": {\\n                    \\\"type\\\": \\\"integer\\\",\\n                    \\\"desc\\\": \\\"Delivery Pincode\\\"\\n                  },\\n                  \\\"CITYSTATE\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"City and State of the destination\\\"\\n                  },\\n                  \\\"FUELMSG\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"desc\\\": \\\"Fuel message that spent on the delivery\\\"\\n                  },\\n                  \\\"FUELCHRG\\\": {\\n                    \\\"type\\\": \\\"integer\\\",\\n                    \\\"desc\\\": \\\"Total Fuel Charges\\\"\\n                  },\\n                  \\\"TOTALAMOUNT\\\": {\\n                    \\\"type\\\": \\\"integer\\\",\\n                    \\\"desc\\\": \\\"Total Amount Spent in the Shipment\\\"\\n                  }\\n                }\\n              },\\n              \\\"SHIPMENT\\\": {\\n                \\\"type\\\": \\\"array\\\",\\n                \\\"desc\\\": \\\"Shipment Details\\\",\\n                \\\"items\\\": {\\n                  \\\"type\\\": \\\"object\\\",\\n                  \\\"properties\\\": {\\n                    \\\"PIECES\\\": {\\n                      \\\"type\\\": \\\"integer\\\",\\n                      \\\"desc\\\": \\\"Total number of pieces\\\"\\n                    },\\n                    \\\"CODE\\\": {\\n                      \\\"type\\\": \\\"string\\\",\\n                      \\\"desc\\\": \\\"Some Code\\\"\\n                    },\\n                    \\\"CLASS\\\": {\\n                      \\\"type\\\": \\\"integer\\\",\\n                      \\\"desc\\\": \\\"Shipment Class\\\"\\n                    },\\n                    \\\"DESCRIPTION\\\": {\\n                      \\\"type\\\": \\\"string\\\",\\n                      \\\"desc\\\": \\\"Shipment description\\\"\\n                    },\\n                    \\\"UOM\\\": {\\n                      \\\"type\\\": \\\"string\\\",\\n                      \\\"desc\\\": \\\"Some UOM\\\"\\n                    },\\n                    \\\"QUANTITY\\\": {\\n                      \\\"type\\\": \\\"integer\\\",\\n                      \\\"desc\\\": \\\"Total Quantity\\\"\\n                    },\\n                    \\\"WEIGHT\\\": {\\n                      \\\"type\\\": \\\"integer\\\",\\n                      \\\"desc\\\": \\\"Total Weight\\\"\\n                    },\\n                    \\\"FLAGS\\\": {\\n                      \\\"type\\\": \\\"string\\\",\\n                      \\\"desc\\\": \\\"Some Country Flag\\\"\\n                    },\\n                    \\\"RATE\\\": {\\n                      \\\"type\\\": \\\"integer\\\",\\n                      \\\"desc\\\": \\\"Rate per mile\\\"\\n                    },\\n                    \\\"AMOUNT\\\": {\\n                      \\\"type\\\": \\\"integer\\\",\\n                      \\\"desc\\\": \\\"Total cost of shipment\\\"\\n                    }\\n                  }\\n                }\\n              }\\n            }\\n          }\\n        }\\n      }\\n    }\\n  }\\n}\""
        }
    ],
    "policies": [
        {
            "description": "Policy_tag1",
            "nodeName": "policy_tag",
            "name": "Policy_tag1",
            "id": "167100035268611.011567976397195",
            "x": 200,
            "y": 250,
            "apikey": "d",
            "yesorno": "NO",
            "userid": "a",
            "password": "d",
            "yesorno1": "YES",
            "jwtsubject": "sad",
            "yesorno2": "",
            "persec": "as",
            "permin": "1",
            "perhour": "sa",
            "perday": "dsa",
            "permonth": "das",
            "peryear": "asd"
        },
        {
            "description": "Policy_tag2",
            "nodeName": "policy_tag",
            "name": "Policy_tag2",
            "id": "167100035650130.945507963243625",
            "x": 410,
            "y": 250,
            "apikey": "dsadsa",
            "yesorno": "",
            "userid": "asd",
            "password": "das",
            "yesorno1": "",
            "jwtsubject": "asd",
            "yesorno2": "",
            "persec": "dsa",
            "permin": "dsa",
            "perhour": "dsa",
            "perday": "dsadas",
            "permonth": "das",
            "peryear": "asfa"
        }
    ]
 }
 

 const elementConnected = async (element) => {
    const data = {
        "description":model.apis[0]["apidescription"],
        "exposedpath":`https://<domain>${model.apis[0]["exposedpath"]}`,
        "method":model.apis[0]["method"],
        "standard" :model.apis[0]["yesorno"]=="YES"?"REST":"NOT REST"

    };
        if (element.getAttribute("styleBody")) data["styleBody"] = `<style>${element.getAttribute("styleBody")}</style>`;
        console.log(element.id);
        console.log(JSON.parse(model.apis[0]["input-output"]));
        let d1 =[];
        traverseObject(JSON.parse(model.apis[0]["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"],function(node) {
            if(node && typeof node =="object") if(node.type) {
                d1.push({"type":node.type,"des":node.desc?node.desc:""})
            }
            console.log(node);
              });
              console.log(d1);
        // console.log(flat_an_object(JSON.parse(model.apis[0]["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"]))
        

    api_contents.setData(element.id, data);
 }

 function traverseObject(target, callback) {
    callback(target);
    if (typeof target === 'object') {
      for (let key in target) {
        traverseObject(target[key], callback);
      }
    }
  }
 
  const flat_an_object =(object)=>{

    let result = {}
  
    const recursiveFunction = (obj)=>{
      for (const key in obj){
        if(typeof obj[key] === "object" && 
           Array.isArray(obj[key]) ===false){
          recursiveFunction(obj[key])
        }
        else{
          result ={...result, [key] : obj[key] }
        }
      }
    }
    recursiveFunction(object);
    return result; 
  }

 
function bindApiContents(element,elementid) {
    // api_contents.getShadowRootByHostId("apicontent").
    const data = {}
    console.log(data);
    console.log(elementid);

    for (const api of model.apis){
        if(api["apiname"] == elementid) {
            data["description"] = api["apidescription"];
            data["exposedpath"] = `https://<domain>${api["exposedpath"]}`;
            data["method"] = api["method"];
            console.log(api["yesorno"]);
            if(api["yesorno"]=="YES") data["standard"] = "REST";
            else data["standard"] = "NOT REST"
            break;
        }
    }
    console.log(data);
 
    api_contents.bindData( data,"apicontent");

}

export const api_contents = {
    trueWebComponentMode: true,elementConnected,bindApiContents
}

monkshu_component.register(
    "api-contents", `${COMPONENT_PATH}/api-contents.html`, api_contents
);