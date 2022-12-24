/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { floating_window } from "../floating-window/floating-window.mjs"


const COMPONENT_PATH = util.getModulePath(import.meta);

// const FLOATING_WINDOW = window.monkshu_env.components["floating-window"];
const CONSOLE_THEME = {
  "var--window-top": "25vh", "var--window-left": "75vh", "var--window-width": "23vw",
  "var--window-height": "45vh", "var--window-background": "#DFF0FE",
  "var--window-border": "1px solid #4788C7", closeIcon: `${COMPONENT_PATH}/img/close.svg`
    }, CONSOLE_HTML_FILE = `${COMPONENT_PATH}/json.html`;

async function inputJson(element, event) {
  event.stopPropagation();
  const host = input_output_fields.getHostElement(element);
  const shadowRoot = input_output_fields.getShadowRootByHost(host);
  const floatingWindowHTML = await $$.requireText(CONSOLE_HTML_FILE);

  let result = await getFinal(shadowRoot.querySelector('#newTree'));
  await floating_window.showWindow("JSON", CONSOLE_THEME, Mustache.render(floatingWindowHTML, { message: `${JSON.stringify(JSON.parse(result), null, 2)}`, error: undefined }));
}

async function outputJson(element, event) {
  event.stopPropagation();
  const host = input_output_fields.getHostElement(element);
  const shadowRoot = input_output_fields.getShadowRootByHost(host);
  const floatingWindowHTML = await $$.requireText(CONSOLE_HTML_FILE);

  let result = await getFinal(shadowRoot.querySelector('#output-childTree'));
  await floating_window.showWindow("JSON", CONSOLE_THEME, Mustache.render(floatingWindowHTML, { message: `${JSON.stringify(JSON.parse(result), null, 2)}`, error: undefined }));
}

const elementConnected = async function (element) {
  Object.defineProperty(element, "value", {
    get: (_) => _getValue(element),
    set: (value) => _setValue(value, element)
  });

  const data = {
    componentPath: COMPONENT_PATH
  };
   input_output_fields.setData(element.id,data);

}

const elementRendered = async function (element) {
  const shadowRoot = input_output_fields.getShadowRootByHostId(element.getAttribute("id"));
  let inputField = shadowRoot.querySelector('#newTree');
  let inputTree = shadowRoot.querySelector('#tree');

  let outputField = shadowRoot.querySelector('#output-childTree');
  if(element.getAttribute("value")) _setValue(JSON.parse(element.getAttribute("value")), inputField, outputField);
  
  const container =  shadowRoot.querySelector('div.input-root');
}

function _getValue(element) {
  const shadowRoot = input_output_fields.getShadowRootByHostId(element.getAttribute("id"));
  let inputField = shadowRoot.querySelector('#newTree');
  let outputField = shadowRoot.querySelector('#output-childTree');


  let inputValue = getFinal(inputField);
  let outPutValue = getFinal(outputField);
  return JSON.stringify([inputValue, outPutValue]);
};

function _setValue(value, inputElement, outputElement) {
  const inputdata = JSON.parse(value[0]);
  const outputdata = JSON.parse(value[1]);

  if(inputdata) {create(inputdata, inputElement);}
  if(outputdata) {create(outputdata, outputElement);}
};


function fieldAdd(classname, divClass, selectClass, inputId, optionId, textareaId) {

  let child = document.createElement('ul');
  child.classList.add(classname);
  child.innerHTML = `<li>
      <div class='${divClass}'>
          <div>
          <span><input type="text" id="${inputId}" name="fname" required class="input-text" placeholder="Field Name"></span>
          <span class="${selectClass}">
              <select name="ftype" id="${optionId}">
                  <option class="values"  value="">Field Type</option>
                  <option class="values" value="string">String</option>
                  <option class="values"  value="boolean">Boolean</option>
                  <option class="values" value="integer">Integer</option>
                  <option class="values" value="object">Object</option>
                  <option class="values" value="array">Array</option>
                  <option class="values" value="null">Null</option>
              </select>
          </span>
          <span class="ok"><img class="addChild" src="${COMPONENT_PATH}/img/ok.svg"></span>
          <svg class="deleteChild" width="20" height="20" viewBox="0 0 20 20" fill="#C4C4C4" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.33333 5H11.6667C11.6667 4.55797 11.4911 4.13405 11.1785 3.82149C10.866 3.50893 10.442 3.33333 10 3.33333C9.55797 3.33333 9.13405 3.50893 8.82149 3.82149C8.50893 4.13405 8.33333 4.55797 8.33333 5ZM6.66667 5C6.66667 4.11594 7.01786 3.2681 7.64298 2.64297C8.2681 2.01785 9.11595 1.66666 10 1.66666C10.8841 1.66666 11.7319 2.01785 12.357 2.64297C12.9821 3.2681 13.3333 4.11594 13.3333 5H17.5C17.721 5 17.933 5.0878 18.0893 5.24408C18.2455 5.40036 18.3333 5.61232 18.3333 5.83333C18.3333 6.05434 18.2455 6.26631 18.0893 6.42259C17.933 6.57887 17.721 6.66666 17.5 6.66666H16.765L16.0267 15.2833C15.9557 16.1154 15.575 16.8905 14.9599 17.4553C14.3448 18.0201 13.5401 18.3334 12.705 18.3333H7.295C6.45993 18.3334 5.65523 18.0201 5.04013 17.4553C4.42502 16.8905 4.04432 16.1154 3.97333 15.2833L3.235 6.66666H2.5C2.27899 6.66666 2.06703 6.57887 1.91075 6.42259C1.75447 6.26631 1.66667 6.05434 1.66667 5.83333C1.66667 5.61232 1.75447 5.40036 1.91075 5.24408C2.06703 5.0878 2.27899 5 2.5 5H6.66667ZM12.5 10C12.5 9.77898 12.4122 9.56702 12.2559 9.41074C12.0996 9.25446 11.8877 9.16666 11.6667 9.16666C11.4457 9.16666 11.2337 9.25446 11.0774 9.41074C10.9211 9.56702 10.8333 9.77898 10.8333 10V13.3333C10.8333 13.5543 10.9211 13.7663 11.0774 13.9226C11.2337 14.0789 11.4457 14.1667 11.6667 14.1667C11.8877 14.1667 12.0996 14.0789 12.2559 13.9226C12.4122 13.7663 12.5 13.5543 12.5 13.3333V10ZM8.33333 9.16666C8.55435 9.16666 8.76631 9.25446 8.92259 9.41074C9.07887 9.56702 9.16667 9.77898 9.16667 10V13.3333C9.16667 13.5543 9.07887 13.7663 8.92259 13.9226C8.76631 14.0789 8.55435 14.1667 8.33333 14.1667C8.11232 14.1667 7.90036 14.0789 7.74408 13.9226C7.5878 13.7663 7.5 13.5543 7.5 13.3333V10C7.5 9.77898 7.5878 9.56702 7.74408 9.41074C7.90036 9.25446 8.11232 9.16666 8.33333 9.16666ZM5.63333 15.1417C5.66884 15.5578 5.85931 15.9455 6.16704 16.2279C6.47477 16.5103 6.87732 16.6669 7.295 16.6667H12.705C13.1224 16.6665 13.5245 16.5097 13.8319 16.2274C14.1393 15.945 14.3295 15.5575 14.365 15.1417L15.0917 6.66666H4.90833L5.635 15.1417H5.63333Z"/>
          </svg>
          </div>
          <div class="fdesc">
              <textarea id="${textareaId}" name="fdesc" placeholder="Field Description" rows="2" cols="50"></textarea>
          </div>
      </div>
      </li>`
  return child;
}

function addMainChild(event, element){
  const host = input_output_fields.getHostElement(element);
  const shadowRoot = input_output_fields.getShadowRootByHost(host);
  if (shadowRoot.querySelector('.container') && event.target.classList == 'addChild') return;
    if (event.target.classList[0] == 'addChild') {
      if(event.target.parentElement.parentElement.classList[1]!="active"){
        event.target.parentElement.parentElement.classList.add('active');
        var content = event.target.parentElement.parentElement.nextElementSibling;
        content.style.display = 'block'
    }
        let child = fieldAdd('parent', 'container', 'cselect', 'fname', 'ftype', 'fdesc')
        shadowRoot.querySelector('#newTree').append(child)
    }
    if(event.target.classList == 'collapse'){
      event.target.parentElement.parentElement.classList.toggle('active');
        var content = event.target.parentElement.parentElement.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    }
}

function addSubChild(event, element){
  const host = input_output_fields.getHostElement(element);
  const shadowRoot = input_output_fields.getShadowRootByHost(host);
  if (event.target.classList == 'addChild' && !shadowRoot.querySelector('.child')) {
    if(event.target.parentElement.classList!='ok'){
    let child = fieldAdd('child', 'container', 'cselect', 'fname', 'ftype', 'fdesc');
    event.target.parentElement.parentElement.append(child);
    let parentSelect = event.target.parentElement.parentElement;
            parentSelect.querySelectorAll(":scope>ul").forEach((ul)=>{
                if(parentSelect.firstChild.classList[2]!= 'active'){parentSelect.firstChild.classList.add('active');}
                ul.style.display = 'block'
            })
  }
}

if (shadowRoot.querySelector('.parent') && !shadowRoot.querySelector('#arrayType')) {
  if (shadowRoot.querySelector('#ftype').value === 'array') {
      let text = document.createElement('span');
      text.id = 'arrayOf';
      text.innerText = 'of';
      shadowRoot.querySelector('.cselect').appendChild(text);
      let arrayType = document.createElement('select');
      arrayType.id = 'arrayType';
      arrayType.innerHTML = `<option class="values"  value="">Field Type</option>
          <option class="values" value="string">String</option>
          <option class="values"  value="boolean">Boolean</option>
          <option class="values" value="integer">Integer</option>
          <option class="values" value="object">Object</option>
          <option class="values" value="array">Array</option>
          <option class="values" value="null">Null</option>`
      shadowRoot.querySelector('.cselect').appendChild(arrayType);
  }
}
if (shadowRoot.querySelector('.child') && !shadowRoot.querySelector('#arrayType')) {
  if (shadowRoot.querySelector('#ftype').value === 'array') {
      let text = document.createElement('span');
      text.id = 'arrayOf';
      text.innerText = 'of';
      shadowRoot.querySelector('.cselect').appendChild(text);
      let arrayType = document.createElement('select');
      arrayType.id = 'arrayType';
      arrayType.innerHTML = `<option class="values"  value="">Field Type</option>
          <option class="values" value="string">String</option>
          <option class="values"  value="boolean">Boolean</option>
          <option class="values" value="integer">Integer</option>
          <option class="values" value="object">Object</option>
          <option class="values" value="array">Array</option>
          <option class="values" value="null">Null</option>`
      shadowRoot.querySelector('.cselect').appendChild(arrayType);
  }
}
if (event.target.classList == 'deleteChild') {
  if (shadowRoot.querySelector('.parent')) shadowRoot.querySelector('.parent').remove();
  else if (shadowRoot.querySelector('.child')) shadowRoot.querySelector('.child').remove();
  else {
      if(event.target.parentElement.parentElement.classList[2] == 'arrayObj'){
          event.target.parentElement.parentElement.parentElement.parentElement.remove();
          shadowRoot.querySelector('#parent-count').innerText = `{${shadowRoot.querySelector('#newTree').childElementCount}}`
      } else {
      event.target.parentElement.parentElement.parentElement.remove();
      shadowRoot.querySelector('#parent-count').innerText = `{${shadowRoot.querySelector('#newTree').childElementCount}}`
      if (event.composedPath()[4].id !== 'newTree') {
          let target = event.composedPath()[4];
          if (target.firstChild.children[2].classList == 'object') target.firstChild.children[2].innerText = `{${target.childElementCount - 1}}`;
      }
  }
  }
}

let field = shadowRoot.querySelector("#fname");
let fielDesc = shadowRoot.querySelector("#fdesc");
let fielType = shadowRoot.querySelector("#ftype");
let arrayType = shadowRoot.querySelector("#arrayType");

if (event.target.parentElement.classList == 'ok' && shadowRoot.querySelector('.parent')) {
  let flag = false;
  let allChild = shadowRoot.querySelector('#newTree').querySelectorAll(":scope>ul.collapsedTry");
  if(allChild){
    for(let i=0;i<allChild.length;i++){
        let keyName = allChild[i].querySelectorAll('.value')[0].innerText.replace(/\s+/g,"").split(':');
        if(field.value == keyName[0]) flag=true;
    }
}
if(flag){
  field.classList.add('error');
  return;
}
  else if(!fielType.value.length || !field.value.length){
    // alert('please fill all fields');
    if(!fielType.value.length && field.value.length) fielType.classList.add('error');
    else if(!field.value.length && fielType.value.length) field.classList.add('error');
    else{
    field.classList.add('error');
    fielType.classList.add('error');
    }
    return;
  } else{
  shadowRoot.querySelector('.parent').remove();
  let child = document.createElement('ul');
  child.classList.add('collapsedTry')
  child.innerHTML = `<li class="align collapsed">
  ${fielType.value == 'object' || (fielType.value == 'array' && arrayType.value == "object") ? `<span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>` : ''}
  ${fielType.value == 'array' ? `<span class="value">${field.value} : ${fielType.value} of ${arrayType.value}</span>` : ''}
  ${fielType.value == 'object' ? `<span class="value">${field.value} : ${fielType.value}</span>` : ''}
  ${fielType.value !== 'object' && fielType.value !== 'array' ? `<span class="value" style='padding-left:28px'>${field.value} : ${fielType.value}</span>` : ""}
  ${fielType.value == "object" ? `<span class="object">{0}</span>` : ''}
  ${fielType.value == "object" ? `<img class="addChild" src="${COMPONENT_PATH}/img/add.svg">` : ''}
  <span class="delete"><svg class="deleteChild" width="20" height="20" viewBox="0 0 20 20" fill="#C4C4C4" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.33333 5H11.6667C11.6667 4.55797 11.4911 4.13405 11.1785 3.82149C10.866 3.50893 10.442 3.33333 10 3.33333C9.55797 3.33333 9.13405 3.50893 8.82149 3.82149C8.50893 4.13405 8.33333 4.55797 8.33333 5ZM6.66667 5C6.66667 4.11594 7.01786 3.2681 7.64298 2.64297C8.2681 2.01785 9.11595 1.66666 10 1.66666C10.8841 1.66666 11.7319 2.01785 12.357 2.64297C12.9821 3.2681 13.3333 4.11594 13.3333 5H17.5C17.721 5 17.933 5.0878 18.0893 5.24408C18.2455 5.40036 18.3333 5.61232 18.3333 5.83333C18.3333 6.05434 18.2455 6.26631 18.0893 6.42259C17.933 6.57887 17.721 6.66666 17.5 6.66666H16.765L16.0267 15.2833C15.9557 16.1154 15.575 16.8905 14.9599 17.4553C14.3448 18.0201 13.5401 18.3334 12.705 18.3333H7.295C6.45993 18.3334 5.65523 18.0201 5.04013 17.4553C4.42502 16.8905 4.04432 16.1154 3.97333 15.2833L3.235 6.66666H2.5C2.27899 6.66666 2.06703 6.57887 1.91075 6.42259C1.75447 6.26631 1.66667 6.05434 1.66667 5.83333C1.66667 5.61232 1.75447 5.40036 1.91075 5.24408C2.06703 5.0878 2.27899 5 2.5 5H6.66667ZM12.5 10C12.5 9.77898 12.4122 9.56702 12.2559 9.41074C12.0996 9.25446 11.8877 9.16666 11.6667 9.16666C11.4457 9.16666 11.2337 9.25446 11.0774 9.41074C10.9211 9.56702 10.8333 9.77898 10.8333 10V13.3333C10.8333 13.5543 10.9211 13.7663 11.0774 13.9226C11.2337 14.0789 11.4457 14.1667 11.6667 14.1667C11.8877 14.1667 12.0996 14.0789 12.2559 13.9226C12.4122 13.7663 12.5 13.5543 12.5 13.3333V10ZM8.33333 9.16666C8.55435 9.16666 8.76631 9.25446 8.92259 9.41074C9.07887 9.56702 9.16667 9.77898 9.16667 10V13.3333C9.16667 13.5543 9.07887 13.7663 8.92259 13.9226C8.76631 14.0789 8.55435 14.1667 8.33333 14.1667C8.11232 14.1667 7.90036 14.0789 7.74408 13.9226C7.5878 13.7663 7.5 13.5543 7.5 13.3333V10C7.5 9.77898 7.5878 9.56702 7.74408 9.41074C7.90036 9.25446 8.11232 9.16666 8.33333 9.16666ZM5.63333 15.1417C5.66884 15.5578 5.85931 15.9455 6.16704 16.2279C6.47477 16.5103 6.87732 16.6669 7.295 16.6667H12.705C13.1224 16.6665 13.5245 16.5097 13.8319 16.2274C14.1393 15.945 14.3295 15.5575 14.365 15.1417L15.0917 6.66666H4.90833L5.635 15.1417H5.63333Z"/>
  </svg></span><div class="description" style="display: none">${fielDesc.value}</div></li>`
  shadowRoot.querySelector('#newTree').append(child)
  shadowRoot.querySelector('#parent-count').innerText = `{${shadowRoot.querySelector('#newTree').childElementCount}}`
  if(fielType.value == 'array' && arrayType.value == 'object'){
      let arrayObj = document.createElement('ul');
      arrayObj.classList.add('collapsedTry');
      arrayObj.style.display = 'block';
      arrayObj.innerHTML = `<li class="align collapsed arrayObj">
      <span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>
      <span class="value">object</span>
      <span class="object" >{0}</span>
      <img class="addChild" src="${COMPONENT_PATH}/img/add.svg">
      </li>
      `
      shadowRoot.querySelector('#newTree').lastChild.firstChild.classList.add('active')
      shadowRoot.querySelector('#newTree').lastChild.appendChild(arrayObj);
  }
}
}
if (event.target.parentElement.classList == 'ok' && shadowRoot.querySelector('.child')) {
  let flag = false;
  let allChild = shadowRoot.querySelector('.child').parentElement.querySelectorAll(":scope>ul.collapsedTry");
  if(allChild){
    for(let i=0;i<allChild.length;i++){
        let keyName = allChild[i].querySelectorAll('.value')[0].innerText.replace(/\s+/g,"").split(':');
        if(field.value == keyName[0]) flag=true;
    }
}
if(flag){
  // alert('cannot have same key name in the same level');
  field.classList.add('error');
  return;
}
  else if(!fielType.value.length || !field.value.length){
    // alert('please fill all fields');
    if(!fielType.value.length && field.value.length) fielType.classList.add('error');
    else if(!field.value.length && fielType.value.length) field.classList.add('error');
    else{
    field.classList.add('error');
    fielType.classList.add('error');
    }
    return;
  } else{
  let child = document.createElement('ul');
  child.classList.add('collapsedTry')
  child.style.display = 'block'
  child.innerHTML = `<li class="align collapsed">
  ${fielType.value == 'object' || (fielType.value == 'array' && arrayType.value == "object") ? `<span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>` : ''}
  ${fielType.value == 'array' ? `<span class="value">${field.value} : ${fielType.value} of ${arrayType.value}</span>` : ''}
  ${fielType.value == 'object' ? `<span class="value">${field.value} : ${fielType.value}</span>` : ''}
  ${fielType.value !== 'object' && fielType.value !== 'array' ? `<span class="value" style='padding-left:28px'>${field.value} : ${fielType.value}</span>` : ""}
  ${fielType.value == "object" ? `<span class="object" >{0}</span>` : ''}
  ${fielType.value == "object" ? `<img class="addChild" src="${COMPONENT_PATH}/img/add.svg">` : ''}
  <span class="delete"><svg class="deleteChild" width="20" height="20" viewBox="0 0 20 20" fill="#C4C4C4" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.33333 5H11.6667C11.6667 4.55797 11.4911 4.13405 11.1785 3.82149C10.866 3.50893 10.442 3.33333 10 3.33333C9.55797 3.33333 9.13405 3.50893 8.82149 3.82149C8.50893 4.13405 8.33333 4.55797 8.33333 5ZM6.66667 5C6.66667 4.11594 7.01786 3.2681 7.64298 2.64297C8.2681 2.01785 9.11595 1.66666 10 1.66666C10.8841 1.66666 11.7319 2.01785 12.357 2.64297C12.9821 3.2681 13.3333 4.11594 13.3333 5H17.5C17.721 5 17.933 5.0878 18.0893 5.24408C18.2455 5.40036 18.3333 5.61232 18.3333 5.83333C18.3333 6.05434 18.2455 6.26631 18.0893 6.42259C17.933 6.57887 17.721 6.66666 17.5 6.66666H16.765L16.0267 15.2833C15.9557 16.1154 15.575 16.8905 14.9599 17.4553C14.3448 18.0201 13.5401 18.3334 12.705 18.3333H7.295C6.45993 18.3334 5.65523 18.0201 5.04013 17.4553C4.42502 16.8905 4.04432 16.1154 3.97333 15.2833L3.235 6.66666H2.5C2.27899 6.66666 2.06703 6.57887 1.91075 6.42259C1.75447 6.26631 1.66667 6.05434 1.66667 5.83333C1.66667 5.61232 1.75447 5.40036 1.91075 5.24408C2.06703 5.0878 2.27899 5 2.5 5H6.66667ZM12.5 10C12.5 9.77898 12.4122 9.56702 12.2559 9.41074C12.0996 9.25446 11.8877 9.16666 11.6667 9.16666C11.4457 9.16666 11.2337 9.25446 11.0774 9.41074C10.9211 9.56702 10.8333 9.77898 10.8333 10V13.3333C10.8333 13.5543 10.9211 13.7663 11.0774 13.9226C11.2337 14.0789 11.4457 14.1667 11.6667 14.1667C11.8877 14.1667 12.0996 14.0789 12.2559 13.9226C12.4122 13.7663 12.5 13.5543 12.5 13.3333V10ZM8.33333 9.16666C8.55435 9.16666 8.76631 9.25446 8.92259 9.41074C9.07887 9.56702 9.16667 9.77898 9.16667 10V13.3333C9.16667 13.5543 9.07887 13.7663 8.92259 13.9226C8.76631 14.0789 8.55435 14.1667 8.33333 14.1667C8.11232 14.1667 7.90036 14.0789 7.74408 13.9226C7.5878 13.7663 7.5 13.5543 7.5 13.3333V10C7.5 9.77898 7.5878 9.56702 7.74408 9.41074C7.90036 9.25446 8.11232 9.16666 8.33333 9.16666ZM5.63333 15.1417C5.66884 15.5578 5.85931 15.9455 6.16704 16.2279C6.47477 16.5103 6.87732 16.6669 7.295 16.6667H12.705C13.1224 16.6665 13.5245 16.5097 13.8319 16.2274C14.1393 15.945 14.3295 15.5575 14.365 15.1417L15.0917 6.66666H4.90833L5.635 15.1417H5.63333Z"/>
  </svg></span><div class="description" style="display: none">${fielDesc.value}</div></li>`
  event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.appendChild(child)
  // child.parentElement = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
  let target = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
  shadowRoot.querySelector('.child').remove();
  if(fielType.value == 'array' && arrayType.value == 'object'){
      let arrayObj = document.createElement('ul');
      arrayObj.classList.add('collapsedTry');
      arrayObj.innerHTML = `<li class="align collapsed arrayObj">
      <span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>
      <span class="value">object</span>
      <span class="object" >{0}</span>
      <img class="addChild" src="${COMPONENT_PATH}/img/add.svg">
      </li>
      `
      target.lastChild.appendChild(arrayObj);
  }
  if (target.firstChild.children[2].classList == 'object') target.firstChild.children[2].innerText = `{${target.childElementCount - 1}}`;
}
}
if (event.target.parentElement.parentElement.parentElement.classList == 'collapsedTry' && event.target.classList != 'addChild') {
  let main = event.target.parentElement.parentElement.parentElement.children;
  if (main[0].classList[2] != 'active' && main[0].classList[3] != 'active') {
      main[0].classList.add('active');
      for (let i = 1; i < main.length; i++) {
          main[i].style.display = 'block'
      }
  } else {
      main[0].classList.remove('active');
      for (let i = 1; i < main.length; i++) {
          main[i].style.display = 'none'
      }
  }
}
}

function addOutputChild(event, element){
  const host = input_output_fields.getHostElement(element);
  const shadowRoot = input_output_fields.getShadowRootByHost(host);
  if (shadowRoot.querySelector('.output-container') && event.target.classList == 'addChild') return; // have to change here
    if (event.target.classList[0] == 'addChild') {
      if(event.target.parentElement.parentElement.classList[1]!="active"){
        event.target.parentElement.parentElement.classList.add('active');
        var content = event.target.parentElement.parentElement.nextElementSibling;
        content.style.display = 'block'
    }
        let child = fieldAdd('output-parent', 'output-container', 'output-cselect', 'output-fname', 'output-ftype', 'output-fdesc')
        shadowRoot.querySelector('#output-childTree').append(child)
    }
    if(event.target.classList == 'collapse'){
      event.target.parentElement.parentElement.classList.toggle('active');
        var content = event.target.parentElement.parentElement.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    }
}

function addOutputSubChild(event, element){
  const host = input_output_fields.getHostElement(element);
  const shadowRoot = input_output_fields.getShadowRootByHost(host);
  if (event.target.classList == 'addChild' && !shadowRoot.querySelector('.output-child')) { // have to change here
    if(event.target.parentElement.classList!='ok'){
    let child = fieldAdd('output-child', 'output-container', 'output-cselect', 'output-fname', 'output-ftype', 'output-fdesc'); // have to change here
    event.target.parentElement.parentElement.append(child);
    let parentSelect = event.target.parentElement.parentElement;
            parentSelect.querySelectorAll(":scope>ul").forEach((ul)=>{
                if(parentSelect.firstChild.classList[2]!= 'active'){parentSelect.firstChild.classList.add('active');}
                ul.style.display = 'block'
            })
  }
}

if (shadowRoot.querySelector('.output-parent') && !shadowRoot.querySelector('#output-arrayType')) { // have to change here
  if (shadowRoot.querySelector('#output-ftype').value === 'array') { // have to change here
      let text = document.createElement('span');
      text.id = 'arrayOf';
      text.innerText = 'of';
      shadowRoot.querySelector('.output-cselect').appendChild(text); // have to change here
      let arrayType = document.createElement('select');
      arrayType.id = 'output-arrayType'; // have to change here
      arrayType.innerHTML = `<option class="values"  value="">Field Type</option>
          <option class="values" value="string">String</option>
          <option class="values"  value="number">Number</option>
          <option class="values" value="integer">Integer</option>
          <option class="values" value="object">Object</option>
          <option class="values" value="array">Array</option>
          <option class="values" value="null">Null</option>`
      shadowRoot.querySelector('.output-cselect').appendChild(arrayType); // have to change here
  }
}
if (shadowRoot.querySelector('.output-child') && !shadowRoot.querySelector('#output-arrayType')) { // have to change here
  if (shadowRoot.querySelector('#output-ftype').value === 'array') { // have to change here
      let text = document.createElement('span');
      text.id = 'arrayOf';
      text.innerText = 'of';
      shadowRoot.querySelector('.output-cselect').appendChild(text); // have to change here
      let arrayType = document.createElement('select');
      arrayType.id = 'output-arrayType'; // have to change here
      arrayType.innerHTML = `<option class="values"  value="">Field Type</option>
          <option class="values" value="string">String</option>
          <option class="values"  value="number">Number</option>
          <option class="values" value="integer">Integer</option>
          <option class="values" value="object">Object</option>
          <option class="values" value="array">Array</option>
          <option class="values" value="null">Null</option>`
      shadowRoot.querySelector('.output-cselect').appendChild(arrayType); // have to change here
  }
}
if (event.target.classList == 'deleteChild') {
  if (shadowRoot.querySelector('.output-parent')) shadowRoot.querySelector('.output-parent').remove(); // have to change here
  else if (shadowRoot.querySelector('.output-child')) shadowRoot.querySelector('.output-child').remove(); // have to change here
  else {
      if(event.target.parentElement.parentElement.classList[2] == 'arrayObj'){
          event.target.parentElement.parentElement.parentElement.parentElement.remove();
          shadowRoot.querySelector('#output-count').innerText = `{${shadowRoot.querySelector('#output-childTree').childElementCount}}`
      } else {
      event.target.parentElement.parentElement.parentElement.remove();
      shadowRoot.querySelector('#output-count').innerText = `{${shadowRoot.querySelector('#output-childTree').childElementCount}}`
      if (event.composedPath()[4].id !== 'output-childTree') {
          let target = event.composedPath()[4];
          if (target.firstChild.children[2].classList == 'object') target.firstChild.children[2].innerText = `{${target.childElementCount - 1}}`;
      }
  }
  }
}

let field = shadowRoot.querySelector("#output-fname"); // have to change here
let fielDesc = shadowRoot.querySelector("#output-fdesc"); // have to change here
let fielType = shadowRoot.querySelector("#output-ftype"); // have to change here
let arrayType = shadowRoot.querySelector("#output-arrayType"); // have to change here

if (event.target.parentElement.classList == 'ok' && shadowRoot.querySelector('.output-parent')) { // have to change here
  let flag = false;
  let allChild = shadowRoot.querySelector('#output-childTree').querySelectorAll(":scope>ul.collapsedTry");
  if(allChild){
    for(let i=0;i<allChild.length;i++){
        let keyName = allChild[i].querySelectorAll('.value')[0].innerText.replace(/\s+/g,"").split(':');
        if(field.value == keyName[0]) flag=true;
    }
}
if(flag){
  // alert('cannot have same key name in the same level');
  field.classList.add('error');
  return;
}
 else if(!fielType.value.length || !field.value.length){
    // alert('please fill all fields');
    if(!fielType.value.length && field.value.length) fielType.classList.add('error');
    else if(!field.value.length && fielType.value.length) field.classList.add('error');
    else{
    field.classList.add('error');
    fielType.classList.add('error');
    }
    return;
  } else {
  shadowRoot.querySelector('.output-parent').remove(); // have to change here
  let child = document.createElement('ul');
  child.classList.add('collapsedTry')
  child.innerHTML = `<li class="align collapsed">
  ${fielType.value == 'object' || (fielType.value == 'array' && arrayType.value == "object") ? `<span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>` : ''}
  ${fielType.value == 'array' ? `<span class="value">${field.value} : ${fielType.value} of ${arrayType.value}</span>` : ''}
  ${fielType.value == 'object' ? `<span class="value">${field.value} : ${fielType.value}</span>` : ''}
  ${fielType.value !== 'object' && fielType.value !== 'array' ? `<span class="value" style='padding-left:28px'>${field.value} : ${fielType.value}</span>` : ""}
  ${fielType.value == "object" ? `<span class="object">{0}</span>` : ''}
  ${fielType.value == "object" ? `<img class="addChild" src="${COMPONENT_PATH}/img/add.svg">` : ''}
  <span class="delete"><svg class="deleteChild" width="20" height="20" viewBox="0 0 20 20" fill="#C4C4C4" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.33333 5H11.6667C11.6667 4.55797 11.4911 4.13405 11.1785 3.82149C10.866 3.50893 10.442 3.33333 10 3.33333C9.55797 3.33333 9.13405 3.50893 8.82149 3.82149C8.50893 4.13405 8.33333 4.55797 8.33333 5ZM6.66667 5C6.66667 4.11594 7.01786 3.2681 7.64298 2.64297C8.2681 2.01785 9.11595 1.66666 10 1.66666C10.8841 1.66666 11.7319 2.01785 12.357 2.64297C12.9821 3.2681 13.3333 4.11594 13.3333 5H17.5C17.721 5 17.933 5.0878 18.0893 5.24408C18.2455 5.40036 18.3333 5.61232 18.3333 5.83333C18.3333 6.05434 18.2455 6.26631 18.0893 6.42259C17.933 6.57887 17.721 6.66666 17.5 6.66666H16.765L16.0267 15.2833C15.9557 16.1154 15.575 16.8905 14.9599 17.4553C14.3448 18.0201 13.5401 18.3334 12.705 18.3333H7.295C6.45993 18.3334 5.65523 18.0201 5.04013 17.4553C4.42502 16.8905 4.04432 16.1154 3.97333 15.2833L3.235 6.66666H2.5C2.27899 6.66666 2.06703 6.57887 1.91075 6.42259C1.75447 6.26631 1.66667 6.05434 1.66667 5.83333C1.66667 5.61232 1.75447 5.40036 1.91075 5.24408C2.06703 5.0878 2.27899 5 2.5 5H6.66667ZM12.5 10C12.5 9.77898 12.4122 9.56702 12.2559 9.41074C12.0996 9.25446 11.8877 9.16666 11.6667 9.16666C11.4457 9.16666 11.2337 9.25446 11.0774 9.41074C10.9211 9.56702 10.8333 9.77898 10.8333 10V13.3333C10.8333 13.5543 10.9211 13.7663 11.0774 13.9226C11.2337 14.0789 11.4457 14.1667 11.6667 14.1667C11.8877 14.1667 12.0996 14.0789 12.2559 13.9226C12.4122 13.7663 12.5 13.5543 12.5 13.3333V10ZM8.33333 9.16666C8.55435 9.16666 8.76631 9.25446 8.92259 9.41074C9.07887 9.56702 9.16667 9.77898 9.16667 10V13.3333C9.16667 13.5543 9.07887 13.7663 8.92259 13.9226C8.76631 14.0789 8.55435 14.1667 8.33333 14.1667C8.11232 14.1667 7.90036 14.0789 7.74408 13.9226C7.5878 13.7663 7.5 13.5543 7.5 13.3333V10C7.5 9.77898 7.5878 9.56702 7.74408 9.41074C7.90036 9.25446 8.11232 9.16666 8.33333 9.16666ZM5.63333 15.1417C5.66884 15.5578 5.85931 15.9455 6.16704 16.2279C6.47477 16.5103 6.87732 16.6669 7.295 16.6667H12.705C13.1224 16.6665 13.5245 16.5097 13.8319 16.2274C14.1393 15.945 14.3295 15.5575 14.365 15.1417L15.0917 6.66666H4.90833L5.635 15.1417H5.63333Z"/>
  </svg></span><div class="description" style="display: none">${fielDesc.value}</div></li>`
  shadowRoot.querySelector('#output-childTree').append(child)
  shadowRoot.querySelector('#output-count').innerText = `{${shadowRoot.querySelector('#output-childTree').childElementCount}}`
  if(fielType.value == 'array' && arrayType.value == 'object'){
      let arrayObj = document.createElement('ul');
      arrayObj.classList.add('collapsedTry');
      arrayObj.style.display = 'block';
      arrayObj.innerHTML = `<li class="align collapsed arrayObj">
      <span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>
      <span>object</span>
      <span class="object" >{0}</span>
      <img class="addChild" src="${COMPONENT_PATH}/img/add.svg">
      </li>
      `
      shadowRoot.querySelector('#output-childTree').lastChild.firstChild.classList.add('active')
      shadowRoot.querySelector('#output-childTree').lastChild.appendChild(arrayObj);
  }
}
}
if (event.target.parentElement.classList == 'ok' && shadowRoot.querySelector('.output-child')) { // have to change here
  let flag = false;
  let allChild = shadowRoot.querySelector('.output-child').parentElement.querySelectorAll(":scope>ul.collapsedTry");
  if(allChild){
    for(let i=0;i<allChild.length;i++){
        let keyName = allChild[i].querySelectorAll('.value')[0].innerText.replace(/\s+/g,"").split(':');
        if(field.value == keyName[0]) flag=true;
    }
}
if(flag){
  // alert('cannot have same key name in the same level');
  field.classList.add('error');
  return;
}
  if(!fielType.value.length || !field.value.length){
    // alert('please fill all fields');
    if(!fielType.value.length && field.value.length) fielType.classList.add('error');
    else if(!field.value.length && fielType.value.length) field.classList.add('error');
    else{
    field.classList.add('error');
    fielType.classList.add('error');
    }
    return;
  } else {
  let child = document.createElement('ul');
  child.classList.add('collapsedTry')
  child.style.display = 'block'
  child.innerHTML = `<li class="align collapsed">
  ${fielType.value == 'object' || (fielType.value == 'array' && arrayType.value == "object") ? `<span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>` : ''}
  ${fielType.value == 'array' ? `<span class="value">${field.value} : ${fielType.value} of ${arrayType.value}</span>` : ''}
  ${fielType.value == 'object' ? `<span class="value">${field.value} : ${fielType.value}</span>` : ''}
  ${fielType.value !== 'object' && fielType.value !== 'array' ? `<span class="value" style='padding-left:28px'>${field.value} : ${fielType.value}</span>` : ""}
  ${fielType.value == "object" ? `<span class="object" >{0}</span>` : ''}
  ${fielType.value == "object" ? `<img class="addChild" src="${COMPONENT_PATH}/img/add.svg">` : ''}
  <span class="delete"><svg class="deleteChild" width="20" height="20" viewBox="0 0 20 20" fill="#C4C4C4" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.33333 5H11.6667C11.6667 4.55797 11.4911 4.13405 11.1785 3.82149C10.866 3.50893 10.442 3.33333 10 3.33333C9.55797 3.33333 9.13405 3.50893 8.82149 3.82149C8.50893 4.13405 8.33333 4.55797 8.33333 5ZM6.66667 5C6.66667 4.11594 7.01786 3.2681 7.64298 2.64297C8.2681 2.01785 9.11595 1.66666 10 1.66666C10.8841 1.66666 11.7319 2.01785 12.357 2.64297C12.9821 3.2681 13.3333 4.11594 13.3333 5H17.5C17.721 5 17.933 5.0878 18.0893 5.24408C18.2455 5.40036 18.3333 5.61232 18.3333 5.83333C18.3333 6.05434 18.2455 6.26631 18.0893 6.42259C17.933 6.57887 17.721 6.66666 17.5 6.66666H16.765L16.0267 15.2833C15.9557 16.1154 15.575 16.8905 14.9599 17.4553C14.3448 18.0201 13.5401 18.3334 12.705 18.3333H7.295C6.45993 18.3334 5.65523 18.0201 5.04013 17.4553C4.42502 16.8905 4.04432 16.1154 3.97333 15.2833L3.235 6.66666H2.5C2.27899 6.66666 2.06703 6.57887 1.91075 6.42259C1.75447 6.26631 1.66667 6.05434 1.66667 5.83333C1.66667 5.61232 1.75447 5.40036 1.91075 5.24408C2.06703 5.0878 2.27899 5 2.5 5H6.66667ZM12.5 10C12.5 9.77898 12.4122 9.56702 12.2559 9.41074C12.0996 9.25446 11.8877 9.16666 11.6667 9.16666C11.4457 9.16666 11.2337 9.25446 11.0774 9.41074C10.9211 9.56702 10.8333 9.77898 10.8333 10V13.3333C10.8333 13.5543 10.9211 13.7663 11.0774 13.9226C11.2337 14.0789 11.4457 14.1667 11.6667 14.1667C11.8877 14.1667 12.0996 14.0789 12.2559 13.9226C12.4122 13.7663 12.5 13.5543 12.5 13.3333V10ZM8.33333 9.16666C8.55435 9.16666 8.76631 9.25446 8.92259 9.41074C9.07887 9.56702 9.16667 9.77898 9.16667 10V13.3333C9.16667 13.5543 9.07887 13.7663 8.92259 13.9226C8.76631 14.0789 8.55435 14.1667 8.33333 14.1667C8.11232 14.1667 7.90036 14.0789 7.74408 13.9226C7.5878 13.7663 7.5 13.5543 7.5 13.3333V10C7.5 9.77898 7.5878 9.56702 7.74408 9.41074C7.90036 9.25446 8.11232 9.16666 8.33333 9.16666ZM5.63333 15.1417C5.66884 15.5578 5.85931 15.9455 6.16704 16.2279C6.47477 16.5103 6.87732 16.6669 7.295 16.6667H12.705C13.1224 16.6665 13.5245 16.5097 13.8319 16.2274C14.1393 15.945 14.3295 15.5575 14.365 15.1417L15.0917 6.66666H4.90833L5.635 15.1417H5.63333Z"/>
  </svg></span><div class="description" style="display: none">${fielDesc.value}</div></li>`
  event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.appendChild(child)
  let target = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
  shadowRoot.querySelector('.output-child').remove(); // have to change here
  if(fielType.value == 'array' && arrayType.value == 'object'){
      let arrayObj = document.createElement('ul');
      arrayObj.classList.add('collapsedTry');
      arrayObj.innerHTML = `<li class="align collapsed arrayObj">
      <span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>
      <span>object</span>
      <span class="object" >{0}</span>
      <img class="addChild" src="${COMPONENT_PATH}/img/add.svg">
      </li>
      `
      target.lastChild.appendChild(arrayObj);
  }
  if (target.firstChild.children[2].classList == 'object') target.firstChild.children[2].innerText = `{${target.childElementCount - 1}}`;
}
}
if (event.target.parentElement.parentElement.parentElement.classList == 'collapsedTry' && event.target.classList != 'addChild') {
  let main = event.target.parentElement.parentElement.parentElement.children;
  if (main[0].classList[2] != 'active' && main[0].classList[3] != 'active') {
      main[0].classList.add('active');
      for (let i = 1; i < main.length; i++) {
          main[i].style.display = 'block'
      }
  } else {
      main[0].classList.remove('active');
      for (let i = 1; i < main.length; i++) {
          main[i].style.display = 'none'
      }
  }
}
}

/**
 * Function to convert html to json
 */

function getChild(parent, jsonFormat){
  let main;
  if(jsonFormat.requestBody){
    main = jsonFormat["requestBody"]["content"]["application/json"]["schema"]["properties"];
  } else if (jsonFormat.responses){
    main = jsonFormat["responses"]["200"]["content"]["application/json"]["schema"]["properties"];
  }
  parent.querySelectorAll(":scope>ul").forEach(function(para){
        getJson(para, main);
    });
    return jsonFormat;
  }
  
  function getJson(ul, obj){
      var keyValArr = ul.querySelectorAll(".value")[0].innerText.replace(/\s+/g, '').split(":");
    var key = keyValArr[0];
    var value = keyValArr[1];
    var description = ul.querySelectorAll(".description")[0].innerText;
    if(key!== 'object' && description){
      if(value.includes("array")){
        obj[key] = {
          "type": "array",
          "desc": description
          }
        }
        else {
          obj[key] = {
            "type": value,
            "desc": description
            }
        }    
  } else if(key!=='object' && !description){
    if(value.includes("array")){
      obj[key] = {
        "type": "array",
        }
    } else {
      obj[key] = {
        "type": value,
        }
    }
    
  }
      // if(key === 'object') delete obj[key]
      if(value.includes('array') && value.includes("object")){
          ul.querySelector(':scope>ul').querySelectorAll(":scope>ul").forEach(function(para){
      if(!obj[key].items){
        obj[key].items = {
            "type":`${value.replace("arrayof","")}`,
            "properties": {}
        }
    }
      
          getJson(para, obj[key].items.properties);
      })
      }
      else if(value.includes('array') && !value.includes("object")){
          if(!obj[key].items){
            obj[key].items = {
              "type":`${value.replace("arrayof","")}`
            }
          }
      }
      else {
        ul.querySelectorAll(':scope>ul').forEach(function(para){
          if(!obj[key].properties){
            obj[key].properties = {}
          }
      
          getJson(para, obj[key].properties);
        })
      }
    return obj;
  }
  
  function getFinal(element){
    let inputJsondata = {
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {}
            }
          }
        }
      }
    }
    let outputJsondata = {
      "responses": {
        "200": {
          "description": "response",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {}
              }
            }
          }
        }
      }
    }
    const host = input_output_fields.getHostElement(element);
  if(element.id == "newTree"){
      let mainObj = getChild(element, inputJsondata);
      return JSON.stringify(mainObj);
  } else {
      let mainObj = getChild(element, outputJsondata);
      return JSON.stringify(mainObj);
  }
}

/**
 * Function to convert json to html
 */

  function createChild(data, parent) {
    for (let key in data) {
        buildHtml(key, data[key], parent);
    }
};

function buildHtml(key, val, target) {
    let child = document.createElement('ul');
    child.classList.add('collapsedTry')
    child.innerHTML = `<li class="align collapsed">
        ${val.type == 'object' || (val.type == 'array' && val.items.type == "object") ? `<span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>` : ''}
        ${(val.type == 'array' && val.items) ? `<span class="value">${key} : ${val.type} of ${val.items.type}</span>` : ''}
        ${val.type == 'object' ? `<span class="value">${key} : ${val.type}</span>` : ''}
        ${val.type !== 'object' && val.type !== 'array' ? `<span class="value" style='padding-left:28px'>${key} : ${val.type}</span>` : ""}
        ${val.type == "object" ? `<span class="object">{0}</span>` : ''}
        ${val.type == "object" ? `<img class="addChild" src="${COMPONENT_PATH}/img/add.svg">` : ''}
        <span class="delete"><svg class="deleteChild" width="20" height="20" viewBox="0 0 20 20" fill="#C4C4C4" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.33333 5H11.6667C11.6667 4.55797 11.4911 4.13405 11.1785 3.82149C10.866 3.50893 10.442 3.33333 10 3.33333C9.55797 3.33333 9.13405 3.50893 8.82149 3.82149C8.50893 4.13405 8.33333 4.55797 8.33333 5ZM6.66667 5C6.66667 4.11594 7.01786 3.2681 7.64298 2.64297C8.2681 2.01785 9.11595 1.66666 10 1.66666C10.8841 1.66666 11.7319 2.01785 12.357 2.64297C12.9821 3.2681 13.3333 4.11594 13.3333 5H17.5C17.721 5 17.933 5.0878 18.0893 5.24408C18.2455 5.40036 18.3333 5.61232 18.3333 5.83333C18.3333 6.05434 18.2455 6.26631 18.0893 6.42259C17.933 6.57887 17.721 6.66666 17.5 6.66666H16.765L16.0267 15.2833C15.9557 16.1154 15.575 16.8905 14.9599 17.4553C14.3448 18.0201 13.5401 18.3334 12.705 18.3333H7.295C6.45993 18.3334 5.65523 18.0201 5.04013 17.4553C4.42502 16.8905 4.04432 16.1154 3.97333 15.2833L3.235 6.66666H2.5C2.27899 6.66666 2.06703 6.57887 1.91075 6.42259C1.75447 6.26631 1.66667 6.05434 1.66667 5.83333C1.66667 5.61232 1.75447 5.40036 1.91075 5.24408C2.06703 5.0878 2.27899 5 2.5 5H6.66667ZM12.5 10C12.5 9.77898 12.4122 9.56702 12.2559 9.41074C12.0996 9.25446 11.8877 9.16666 11.6667 9.16666C11.4457 9.16666 11.2337 9.25446 11.0774 9.41074C10.9211 9.56702 10.8333 9.77898 10.8333 10V13.3333C10.8333 13.5543 10.9211 13.7663 11.0774 13.9226C11.2337 14.0789 11.4457 14.1667 11.6667 14.1667C11.8877 14.1667 12.0996 14.0789 12.2559 13.9226C12.4122 13.7663 12.5 13.5543 12.5 13.3333V10ZM8.33333 9.16666C8.55435 9.16666 8.76631 9.25446 8.92259 9.41074C9.07887 9.56702 9.16667 9.77898 9.16667 10V13.3333C9.16667 13.5543 9.07887 13.7663 8.92259 13.9226C8.76631 14.0789 8.55435 14.1667 8.33333 14.1667C8.11232 14.1667 7.90036 14.0789 7.74408 13.9226C7.5878 13.7663 7.5 13.5543 7.5 13.3333V10C7.5 9.77898 7.5878 9.56702 7.74408 9.41074C7.90036 9.25446 8.11232 9.16666 8.33333 9.16666ZM5.63333 15.1417C5.66884 15.5578 5.85931 15.9455 6.16704 16.2279C6.47477 16.5103 6.87732 16.6669 7.295 16.6667H12.705C13.1224 16.6665 13.5245 16.5097 13.8319 16.2274C14.1393 15.945 14.3295 15.5575 14.365 15.1417L15.0917 6.66666H4.90833L5.635 15.1417H5.63333Z"/>
        </svg></span><div class="description" style="display: none">${val.desc ? val.desc : ''}</div></li>`

    target.append(child);

    if (val.type == 'object') {
        let updatedVal = val.properties;
        // delete updatedVal.type;
        // delete updatedVal.desc;
        createChild(updatedVal, child);
    }
    else if (val.type == 'array' && val.items.type == "object") {
        let updatedVal = val.items.properties;
        // delete updatedVal.type;
        // delete updatedVal.desc;

        let arrayObj = document.createElement('ul');
        arrayObj.classList.add('collapsedTry');
        arrayObj.innerHTML = `<li class="align collapsed arrayObj">
            <span class="collapse-arrow"><img src="${COMPONENT_PATH}/img/collapse.svg" alt="collapse-arrow"></span>
            <span class="value">object</span>
            <span class="object" >{0}</span>
            <img class="addChild" src="${COMPONENT_PATH}/img/add.svg">
            </li>
            `
        child.append(arrayObj);
        createChild(updatedVal, arrayObj);
    }
    else if(val.type == "array" && val.items.type !== "object"){
      let updatedVal = val;
      delete val.items;
      createChild(updatedVal, child)
  }
}

function childCount(element) {
    if(element.previousElementSibling.querySelector('#parent-count')){
      // element.previousElementSibling.classList.add = 'active';
      element.previousElementSibling.querySelector('#parent-count').innerText = `{${element.childElementCount}}`
    }
    else if(element.previousElementSibling.querySelector('#output-count')){
      element.previousElementSibling.querySelector('#output-count').innerText = `{${element.childElementCount}}`
    }
    let all = element.querySelectorAll('ul');
    for (let i = 0; i < all.length; i++) {
        if (all[i].querySelector('span.object')) {
            all[i].querySelector('span.object').innerText = `{${all[i].childElementCount - 1}}`
        }
    }
}

function create(jsonStr, element) {
  element.previousElementSibling.classList.add('active');
    element.style.display = 'block';
    if(jsonStr.requestBody){
      let inputSide = jsonStr["requestBody"]["content"]["application/json"]["schema"]["properties"];
      createChild(inputSide, element);
      childCount(element);
    }
    else {
      let outputSide = jsonStr["responses"]["200"]["content"]["application/json"]["schema"]["properties"];
      createChild(outputSide, element);
      childCount(element);
    }
}

export const input_output_fields = {
  trueWebComponentMode: true, elementRendered,elementConnected, addMainChild, addSubChild, addOutputChild, addOutputSubChild, getChild, getJson, getFinal, 
  inputJson, outputJson, create, createChild, buildHtml, childCount
}

monkshu_component.register(
  "input-output-fields", `${COMPONENT_PATH}/input-output-fields.html`, input_output_fields
);