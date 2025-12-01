if (typeof EXTENSION == "undefined" || !EXTENSION) {
  var EXTENSION = {
    panelExists: false,
    screenshot: null,
    pageClickHandler: null,

    toggleExtension: function (pageClickHandler) {
      if (!EXTENSION.panelExists) {
        EXTENSION.pageClickHandler = pageClickHandler;
        EXTENSION.turnExtensionOn();
      } else {
        EXTENSION.turnExtensionOff();
      }
    },

    turnExtensionOn: function () {
      EXTENSION.panelExists = true;
      EXTENSION.UI.createScreenProtector();
      EXTENSION.UI.createLens();
      EXTENSION.UI.createPanel();
      document.addEventListener("click", EXTENSION.pageClickHandler);
      document.addEventListener("mousemove", EXTENSION.UI.mouseMoveHandler);

      EXTENSION.UI.boundZoomHandler = EXTENSION.UI.zoomHandler.bind(
        EXTENSION.UI
      );
      document.addEventListener("wheel", EXTENSION.UI.boundZoomHandler, {
        passive: false,
      });
    },

    turnExtensionOff: function () {
      EXTENSION.panelExists = false;
      EXTENSION.UI?.panel?.remove();
      EXTENSION.UI?.lens?.remove();
      EXTENSION.UI?.screenProtector?.remove();

      document.removeEventListener("click", EXTENSION.pageClickHandler);
      document.removeEventListener("mousemove", EXTENSION.UI.mouseMoveHandler);
      document.removeEventListener("wheel", EXTENSION.UI.boundZoomHandler, {
        passive: false,
      });
      delete EXTENSION.pageClickHandler;
    },
  };
}

EXTENSION.utils = {
  setCellsCount: function (lensAmplif) {
    return 15 - 2 * lensAmplif;
  },
  setGridCellsSize: function (lensSize, cellCount) {
    return lensSize / cellCount;
  },

  handleScreenshot: function (dataUrl, x, y) {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const scale = window.devicePixelRatio || 1;

      const px = Number.isFinite(x) ? Math.round(x * scale) : canvas.width / 2;
      const py = Number.isFinite(y) ? Math.round(y * scale) : canvas.height / 2;

      const pixel = ctx.getImageData(px, py, 1, 1).data;
      EXTENSION.UI.drawHistoryLine(pixel, x, y);
      EXTENSION.screenshot = img;
    };
    img.src = dataUrl;
  },
};

EXTENSION.UI = {
  screenProtector: null,

  panel: null,
  historyBlock: null,

  lens: null,
  lensGrid: null,
  lensCenter: null,
  cellCount: 13,
  gridCellsSize: 10,
  lensAmplif: 1,
  lensSize: 130,

  boundZoomHandler: null,

  createScreenProtector: function () {
    this.screenProtector = HtmlElement.create({
      type: "div",
      id: "picker-screen-protector",
      classes: "picker-screen-protector",
    }).appendTo(document.body);
  },

  createLens: function () {
    this.lens = HtmlElement.create({
      type: "div",
      id: "picker-lens",
      classes: "picker-lens",
    }).appendTo(this.screenProtector);

    this.lensGrid = HtmlElement.create({
      type: "div",
      classes: "picker-lens-grid",
      styles: {
        "background-size": `${this.gridCellsSize}px ${this.gridCellsSize}px`,
      },
    }).appendTo(this.lens);

    this.lensCenter = HtmlElement.create({
      type: "div",
      id: "picker-lens-center",
      classes: "picker-lens-center",
      styles: {
        width: `${this.gridCellsSize}px`,
        height: `${this.gridCellsSize}px`,
      },
    }).appendTo(this.lensGrid);
  },

  createPanel: function () {
    this.panel = HtmlElement.create({
      type: "div",
      id: "picker-panel",
      classes: "picker-panel",
    })
      .addChild({
        type: "div",
        id: "picker-title",
        classes: "picker-title",
        value: "Selected colors:",
      })
      .addChild({
        type: "button",
        id: "picker-close",
        classes: "picker-close",
        value: "x",
        events: {
          click: () => EXTENSION.turnExtensionOff(),
        },
      })
      .appendTo(document.body);

    this.historyBlock = HtmlElement.create({
      type: "div",
      id: "picker-history-block",
      classes: "picker-history-block",
    }).appendTo(this.panel);

    this.zoomBlock = HtmlElement.create({
      type: "input",
      id: "picker-zoom-input",
      classes: "picker-zoom-input",
      value: this.lensAmplif,
      events: {
        input: (e) => {
          this.lensAmplif = Number(e.target.value);
          if (this.lensAmplif > 5) this.lensAmplif = 5;
          if (this.lensAmplif < 1) this.lensAmplif = 1;
          this.setLensZoom(this.lensAmplif);
        },
      },
    }).appendTo(this.panel);
  },

  setLensZoom: function (newLensAmplif) {
    this.cellCount = EXTENSION.utils.setCellsCount(newLensAmplif);
    this.gridCellsSize = EXTENSION.utils.setGridCellsSize(
      this.lensSize,
      this.cellCount
    );

    this.lensGrid.setStyle({
      "background-size": `${this.gridCellsSize}px ${this.gridCellsSize}px`,
    });

    this.lensCenter.setStyle({
      width: `${this.gridCellsSize}px`,
      height: `${this.gridCellsSize}px`,
    });
  },

  drawLens: function (x, y) {
    if (!document.getElementById("picker-lens")) {
      this.createLens();
    }

    let lensTop, lensLeft;

    if (y > window.innerHeight / 2) {
      lensTop = y - this.lensSize - 10;
    } else {
      lensTop = y + 10;
    }

    if (x + window.scrollX > window.innerWidth / 2) {
      lensLeft = x - this.lensSize - 10;
    } else {
      lensLeft = x + 10;
    }

    if (this.lens?.styles?.["display"] === "none") {
      this.lens.setStyle({ display: "block" });
    }
    this.lens.setStyle({ top: `${lensTop}px`, left: `${lensLeft}px` });

    if (EXTENSION.screenshot) {
      const lensCanvas = document.createElement("canvas");
      lensCanvas.width = this.lensSize;
      lensCanvas.height = this.lensSize;
      const ctx = lensCanvas.getContext("2d");

      const scale = window.devicePixelRatio || 1;
      const sx = Math.round(x * scale);
      const sy = Math.round(y * scale);

      ctx.imageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false; // Firefox
      ctx.msImageSmoothingEnabled = false; // Edge

      ctx.drawImage(
        EXTENSION.screenshot,
        sx - Math.floor(this.cellCount / 2),
        sy - Math.floor(this.cellCount / 2),
        this.cellCount,
        this.cellCount,
        0,
        0,
        this.lensSize,
        this.lensSize
      );

      const url = lensCanvas.toDataURL("image/png");
      this.lens.setStyle({ "background-image": `url(${url})` });
    }
  },

  hideLens: function () {
    this.lens?.setStyle({ display: "none" });
  },

  mouseMoveHandler: function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (EXTENSION.UI.panel && EXTENSION.UI.panel.element.contains(e.target)) {
      EXTENSION.UI.hideLens();
    } else {
      EXTENSION.UI.drawLens(e.clientX, e.clientY);
    }
  },

  zoomHandler: function (e) {
    if (!EXTENSION.panelExists) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.deltaY < 0) {
      this.lensAmplif =
        this.lensAmplif === 5 ? this.lensAmplif : this.lensAmplif + 1;
    } else {
      this.lensAmplif =
        this.lensAmplif === 1 ? this.lensAmplif : this.lensAmplif - 1;
    }

    this.zoomBlock.setValue(this.lensAmplif);

    this.setLensZoom(this.lensAmplif);
    this.mouseMoveHandler(e);
  },

  drawHistoryLine: function (pixel, x, y) {
    const hex =
      "#" +
      [pixel[0], pixel[1], pixel[2]]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");

    const rgba = "rgba(" + pixel.toString(", ") + ")";

    if (this.historyBlock.element && Number.isFinite(x) && Number.isFinite(y)) {
      HtmlElement.create({
        type: "div",
        classes: "picker-color-line",
      })
        .addChild({
          type: "div",
          classes: "picker-color-square",
          styles: { "background-color": hex },
        })
        .addChild({
          type: "div",
          classes: "picker-color-text",
          value: hex,
        })
        .addChild({
          type: "div",
          classes: "picker-color-text",
          value: rgba,
        })
        .prependTo(this.historyBlock);
    }
  },
};
