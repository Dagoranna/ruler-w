if (typeof EXTENSION == "undefined" || !EXTENSION) {
  var EXTENSION = {
    panelExists: false,
    selectingSquare: false,

    toggleExtension: function () {
      if (!EXTENSION.panelExists) {
        EXTENSION.turnExtensionOn();
      } else {
        EXTENSION.turnExtensionOff();
      }
    },

    turnExtensionOn: function () {
      console.log("turnExtensionOn");

      EXTENSION.panelExists = true;
      EXTENSION.UI.createScreenProtector();
      EXTENSION.UI.createPanel();
      EXTENSION.UI.historyCounter = 1;

      EXTENSION.UI.boundMouseMove = EXTENSION.UI.mouseMoveHandler.bind(
        EXTENSION.UI
      );
      EXTENSION.UI.boundMouseUp = EXTENSION.UI.pageMouseUp.bind(EXTENSION.UI);
      EXTENSION.UI.boundMouseDown = EXTENSION.UI.pageMouseDown.bind(
        EXTENSION.UI
      );

      document.addEventListener("mousedown", EXTENSION.UI.boundMouseDown);
    },

    turnExtensionOff: function () {
      EXTENSION.panelExists = false;
      EXTENSION.UI?.panel?.remove();
      EXTENSION.UI?.screenProtector?.remove();

      document.removeEventListener("mousedown", EXTENSION.UI.boundMouseDown);
      document.removeEventListener("mousemove", EXTENSION.UI.boundMouseMove);
      document.removeEventListener("mouseup", EXTENSION.UI.boundMouseUp);
    },
  };
}

EXTENSION.UI = {
  screenProtector: null,

  panel: null,
  historyBlock: null,
  historyCounter: 1,

  squareElem: null,
  upperCornerX: 0,
  upperCornerY: 0,

  squareWidth: 0,
  squareHeight: 0,

  upperElem: null,
  lowerElem: null,
  widthElem: null,
  heightElem: null,

  boundMouseMove: null,
  boundMouseUp: null,
  boundMouseDown: null,

  createScreenProtector: function () {
    this.screenProtector = HtmlElement.create({
      type: "div",
      id: "extension-screen-protector",
      classes: "extension-screen-protector",
    }).appendTo(document.body);
  },

  createPanel: function () {
    this.panel = HtmlElement.create({
      type: "div",
      id: "extension-panel",
      classes: "extension-panel",
    })
      .addChild({
        type: "div",
        id: "extension-title",
        classes: "extension-title",
        value: "Selected squares:",
      })
      .addChild({
        type: "button",
        id: "extension-close",
        classes: "extension-close",
        value: "x",
        events: {
          click: () => EXTENSION.turnExtensionOff(),
        },
      })
      .appendTo(document.body);

    this.historyBlock = HtmlElement.create({
      type: "div",
      id: "extension-history-block",
      classes: "extension-history-block",
    }).appendTo(this.panel);
  },

  pageMouseDown: function (e) {
    if (!EXTENSION.panelExists) return;
    if (this.panel && this.panel.element.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    this.upperCornerX = e.clientX;
    this.upperCornerY = e.clientY;
    this.squareWidth = 0;
    this.squareHeight = 0;

    if (!EXTENSION.selectingSquare) {
      EXTENSION.selectingSquare = true;
      document.querySelector(".extension-square-elem")?.remove();
      this.squareElem = HtmlElement.create({
        type: "div",
        classes: "extension-square-elem",
        styles: {
          top: this.upperCornerY + "px",
          left: this.upperCornerX + "px",
        },
      }).appendTo(this.screenProtector);

      this.upperElem = HtmlElement.create({
        type: "div",
        id: "extension-upper-corner",
        classes: "extension-corner-elem extension-upper-corner",
        value: this.upperCornerX + "px, " + this.upperCornerY + "px",
      }).appendTo(this.squareElem);

      this.lowerElem = HtmlElement.create({
        type: "div",
        id: "extension-lower-corner",
        classes: "extension-corner-elem extension-lower-corner",
      }).appendTo(this.squareElem);

      this.widthElem = HtmlElement.create({
        type: "div",
        id: "extension-width-elem",
        classes: "extension-width-elem",
      }).appendTo(this.squareElem);

      this.heightElem = HtmlElement.create({
        type: "div",
        id: "extension-height-elem",
        classes: "extension-height-elem",
      }).appendTo(this.squareElem);

      document.addEventListener("mousemove", this.boundMouseMove);
      document.addEventListener("mouseup", this.boundMouseUp);
    }
  },

  mouseMoveHandler: function (e) {
    e.preventDefault();
    e.stopPropagation();
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    if (this.panel && this.panel.element.contains(e.target)) {
      EXTENSION.selectingSquare = false;
      document.querySelector(".extension-square-elem")?.remove();
      this.squareElem = null;
    } else {
      this.squareWidth = mouseX - this.upperCornerX;
      this.squareHeight = mouseY - this.upperCornerY;
      if (!this.squareElem) return;
      this.squareElem.setStyle({
        width: this.squareWidth + "px",
        height: this.squareHeight + "px",
      });

      this.lowerElem.setValue(mouseX + "px, " + mouseY + "px");
      this.widthElem.setValue(this.squareWidth + "px");
      this.heightElem.setValue(this.squareHeight + "px");
    }
  },

  pageMouseUp: function (e) {
    e.preventDefault();
    e.stopPropagation();

    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
    EXTENSION.selectingSquare = false;
    console.log("write to history");

    HtmlElement.create({
      type: "div",
      value:
        this.historyCounter++ +
        ". w" +
        this.squareWidth +
        " h" +
        this.squareHeight,
    }).prependTo(this.historyBlock);
  },
};
