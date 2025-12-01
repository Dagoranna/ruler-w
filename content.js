const api = typeof browser !== "undefined" ? browser : chrome;

console.log("content.js loaded");

$(function () {
  var panelExists = false;
  var panel, historyBlock, screenProtector, squareElem, squareFill;
  var counter = 0;

  var mouseX = 0;
  var mouseY = 0;
  var squareWidth, squareHeight;
  var selectingSquare = false;
  var upperCorner, lowerCorner;
  var widthElem, heightElem;

  function createPanel() {
    panel = document.createElement("div");
    panel.className = "extension-panel";

    var title = document.createElement("div");
    title.className = "extension-title";
    title.textContent = "Selected squares";

    historyBlock = document.createElement("div");
    historyBlock.className = "extension-history-block";

    var closeBtn = document.createElement("div");
    closeBtn.className = "extension-close";
    closeBtn.textContent = "x";
    closeBtn.addEventListener("click", () => removePanel());

    panel.append(title);
    panel.append(historyBlock);
    panel.append(closeBtn);
    document.body.append(panel);

    screenProtector = document.createElement("div");
    screenProtector.className = "extension-screen-protector";
    screenProtector.addEventListener("mousedown", pageMouseDown);
    screenProtector.addEventListener("mouseup", pageMouseUp);
    document.body.append(screenProtector);
  }

  function pageMouseDown(e) {
    if (!panelExists) return;
    if (panel && panel.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();
    mouseX = e.clientX;
    mouseY = e.clientY;
    squareWidth = 0;
    squareHeight = 0;

    if (!selectingSquare) {
      selectingSquare = true;
      screenProtector.querySelector(".extension-square-elem")?.remove();
      squareElem = document.createElement("div");
      squareElem.className = "extension-square-elem";
      squareElem.style.top = e.clientY + "px";
      squareElem.style.left = e.clientX + "px";
      screenProtector.append(squareElem);

      squareFill = document.createElement("div");
      squareFill.className = "extension-square-fill";
      squareElem.append(squareFill);

      upperCorner = document.createElement("div");
      upperCorner.className = "extension-corner-elem extension-upper-corner";
      upperCorner.textContent = `x=${parseInt(
        getComputedStyle(squareElem).left
      )}px
      y=${parseInt(getComputedStyle(squareElem).top)}px`;
      squareElem.append(upperCorner);

      lowerCorner = document.createElement("div");
      lowerCorner.className = "extension-corner-elem extension-lower-corner";
      squareElem.append(lowerCorner);

      widthElem = document.createElement("div");
      widthElem.className = "extention-width-elem";
      squareElem.append(widthElem);

      heightElem = document.createElement("div");
      heightElem.className = "extention-height-elem";
      squareElem.append(heightElem);

      screenProtector.addEventListener("mousemove", mouseMoveHandler);

      counter++;
    } else {
      selectingSquare = false;
      screenProtector.removeEventListener("mousemove", mouseMoveHandler);
    }
  }

  function pageMouseUp(e) {
    selectingSquare = false;
    screenProtector.removeEventListener("mousemove", mouseMoveHandler);
    var logString = document.createElement("div");
    if (parseInt(squareWidth) < 0) squareWidth = 0;
    if (parseInt(squareHeight) < 0) squareHeight = 0;
    logString.textContent =
      counter + ". w" + parseInt(squareWidth) + " h" + parseInt(squareHeight);
    historyBlock.append(logString);
  }

  function mouseMoveHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    if (panel && panel.contains(e.target)) {
      squareElem?.remove();
      selectingSquare = false;
    } else {
      squareWidth =
        e.clientX - parseInt(getComputedStyle(squareElem).left) + "px";
      squareElem.style.width = squareWidth;
      squareHeight =
        e.clientY - parseInt(getComputedStyle(squareElem).top) + "px";
      squareElem.style.height = squareHeight;

      var cornerX =
        parseInt(getComputedStyle(squareElem).left) +
        +parseInt(getComputedStyle(squareElem).width);
      var cornerY =
        parseInt(getComputedStyle(squareElem).top) +
        parseInt(getComputedStyle(squareElem).height);

      lowerCorner.textContent = `x=${cornerX}px
        y=${cornerY}px`;

      widthElem.textContent =
        parseInt(getComputedStyle(squareElem).width) + "px";
      heightElem.textContent =
        parseInt(getComputedStyle(squareElem).height) + "px";
    }
  }

  function removePanel() {
    panel.remove();
    screenProtector.remove();
    panelExists = false;
    counter = 0;
    //screenProtector.removeEventListener("mousemove", mouseMoveHandler);
  }

  api.runtime.onMessage.addListener((msg) => {
    if (msg.type === "toggle-panel") {
      if (!panelExists) {
        createPanel();
        panelExists = true;
      } else {
        removePanel();
      }
    }
  });
});
