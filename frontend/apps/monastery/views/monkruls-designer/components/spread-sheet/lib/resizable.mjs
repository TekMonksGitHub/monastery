/**
 * Makes an HTML table columns resizable
 * Refactored from: https://www.brainbell.com/javascript/download/demo-resizable.html
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

function makeResizableTable(table, barStyle="1px solid #444444", callbacks) {
  const row = table.getElementsByTagName("tr")[0],
  cols = row ? row.children : undefined; if (!cols) return;
  
  table.style.overflow = "hidden";
  
  for (let i = 0; i < cols.length; i++) {
    const div = _createDiv(table.offsetHeight);
    cols[i].appendChild(div); cols[i].style.position = "relative"; _setListeners(div, table, barStyle, callbacks);
  }
}

function _setListeners(div, table, barStyle, callbacks) {
  let pageX, curCol, nxtCol, curColWidth, nxtColWidth;
  
  div.addEventListener("mousedown", e => {
    curCol = e.target.parentElement; nxtCol = curCol.nextElementSibling; pageX = e.pageX; 
    
    const padding = _paddingDiff(curCol); 
    curColWidth = curCol.offsetWidth - padding;
    if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;
    if (callbacks && callbacks.onresize) {callbacks.onresize(curCol); if (nxtCol) callbacks.onresize(nxtCol);}
  });

  div.addEventListener("mouseover", e => {e.target.style.height = table.offsetHeight; e.target.style.borderRight = barStyle});

  div.addEventListener("mouseout", e => e.target.style.borderRight = "");

  document.addEventListener("mousemove", e => {
    if (!curCol) return;
    
    const diffX = e.pageX - pageX;
    if (nxtCol) nxtCol.style.width = (nxtColWidth - (diffX))+"px";
    curCol.style.width = (curColWidth + diffX)+"px";
    if (callbacks && callbacks.onresize) {callbacks.onresize(curCol); if (nxtCol) callbacks.onresize(nxtCol);}
  });

  document.addEventListener("mouseup", _ => { 
    curCol = undefined; nxtCol = undefined; pageX = undefined; nxtColWidth = undefined; 
    curColWidth = undefined
  });
}
 
function _createDiv(height) {
  const div = document.createElement("div");
  div.style.top = 0; div.style.right = 0; div.style.width = "5px";
  div.style.position = "absolute"; div.style.cursor = "col-resize"; 
  div.style.userSelect = "none"; div.style.height = height + "px";
  return div;
}

function _paddingDiff(col) {
  if (getStyleVal(col,"box-sizing") == "border-box") return 0;
 
  const padLeft = getStyleVal(col,"padding-left"), padRight = getStyleVal(col,"padding-right");
  return (parseInt(padLeft) + parseInt(padRight));

}

const getStyleVal = (elm,css) => window.getComputedStyle(elm, null).getPropertyValue(css);

export const resizable = {makeResizableTable};