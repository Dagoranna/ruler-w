//////// HtmlElement constructor and methods

function HtmlElement(elem) {
  //elem type | whole elem | json
  this.initArgs = elem;

  if (typeof elem === "string") {
    this.element = document.createElement(elem);
    this.tagName = this.element.tagName.toUpperCase();
  } else if (elem?.nodeType) {
    this.element = elem;
    this.tagName = elem.tagName.toUpperCase();
  } else {
    let elemType = elem?.type ? elem?.type : "DIV";
    if (elem?.id && document.getElementById(elem.id)) {
      this.element = document.getElementById(elem.id);
    } else {
      this.element = document.createElement(elemType);
    }
    this.tagName = this.element.tagName.toUpperCase();
  }

  switch (this.tagName) {
    case "DIV":
    case "LI":
    case "SPAN":
    case "P":
    case "BUTTON":
      this.bindValue = "textContent";
      break;
    case "INPUT":
    case "TEXTAREA":
    case "SELECT":
      this.bindValue = "value";
      break;
    default:
      this.bindValue = null;
  }

  if (elem?.id) {
    this.element.id = elem?.id;
  }

  if (elem?.classes) {
    //классы массивом, либо строкой через запятые или пробелы
    //default: typeof classes = string
    this.element.className = Array.isArray(elem.classes)
      ? elem.classes.join(" ")
      : elem.classes.split(/,\s*|\s+/).join(" ");
  }

  if (elem?.value !== undefined && this.bindValue) {
    this.element[this.bindValue] = elem.value;
    this.value = elem.value;
  }

  if (elem?.events && typeof elem.events === "object") {
    // события передаются объектом вида
    // events: {название события: обработчик, ...}
    this.events = {};
    for (let key in elem.events) {
      if (
        elem.events.hasOwnProperty(key) &&
        typeof elem.events[key] === "function"
      ) {
        //названия событий могут быть click или onClick
        //default: event names are "click", "change" etc.
        const eventName = key.replace(/^on/, "").toLowerCase();
        this.element.addEventListener(eventName, elem.events[key]);
        this.events[eventName] = elem.events[key];
      }
    }
  }

  if (elem?.attrs) {
    this.attrs = elem.attrs;
    for (let key in elem.attrs) {
      this.element.setAttribute(key, elem.attrs[key]);
    }
  }

  if (elem?.styles) {
    //стили отдельно для удобства обращения к ним
    this.styles = elem.styles;
    for (let key in elem.styles) {
      this.element.style.setProperty(key, elem.styles[key]);
    }
  }

  /*  if (elem.bonds) {
    // связи передаются объектом вида
    // bonds: {clients: [], hosts: [], syncs: []}
    if (this.bonds?.clients) {
      this.bonds.clients.forEach((client) => {
        if (typeof client === 'string'){
          //передан айди без доп.обработки
          //HtmlElement.create(client);
        }
      });
    }
  }*/
}

HtmlElement.create = function (elem) {
  return new HtmlElement(elem);
};

HtmlElement.prototype.remove = function () {
  this.element.remove();
  return this;
};

HtmlElement.prototype.addId = function (id) {
  if (id !== undefined) this.element.id = id;
  return this;
};

HtmlElement.prototype.addClass = function (className) {
  className && this.element.classList.add(className);
  return this;
};

HtmlElement.prototype.removeClass = function (className) {
  className && this.element.classList.remove(className);
  return this;
};

HtmlElement.prototype.addClasses = function (...classNames) {
  for (let className of classNames) {
    this.addClass(className);
  }
  return this;
};

HtmlElement.prototype.setValue = function (val) {
  this.element[this.bindValue] = val;
  return this;
};

HtmlElement.prototype.setAttr = function (attrName, attrVal) {
  this.element.setAttribute(attrName, attrVal);
  return this;
};

HtmlElement.prototype.setStyle = function (styles) {
  //стили передаются объектом вида
  //{display: "block", ...}
  if (!this.styles) this.styles = {};
  for (let key in styles) {
    this.element.style.setProperty(key, styles[key]);
    this.styles[key] = styles[key];
  }
  return this;
};

HtmlElement.prototype.addChild = function (args = {}) {
  const child = HtmlElement.create(args);
  this.append(child);
  return this;
};

HtmlElement.prototype.addAndReturnChild = function (args = {}) {
  const child = HtmlElement.create(args);
  this.append(child);
  return child;
};

HtmlElement.prototype.addChildren = function (children = []) {
  for (let child of children) {
    this.addChild(child);
  }
  return this;
};

HtmlElement.prototype.getChild = function (selector) {
  const el = this.element.querySelector(selector);
  return el ? new HtmlElement(el) : null;
};

HtmlElement.prototype.append = function (htmlElement) {
  this.element.appendChild(htmlElement.element);
  return this;
};

/*
HtmlElement.prototype.appendTo = function (domElement) {
  domElement.appendChild(this.element);
  return this;
};*/
HtmlElement.prototype.appendTo = function (domElement) {
  const target =
    domElement instanceof HtmlElement ? domElement.element : domElement;
  target.appendChild(this.element);
  return this;
};

HtmlElement.prototype.prependTo = function (domElement) {
  const target =
    domElement instanceof HtmlElement ? domElement.element : domElement;
  target.insertBefore(this.element, target.firstChild);
  return this;
};

HtmlElement.prototype.addListener = function (type, callback) {
  this.element.addEventListener(type, callback);
  return this;
};

HtmlElement.prototype.clone = function () {
  const clonedDom = this.element.cloneNode(true);
  const clone = new HtmlElement(clonedDom);

  if (this.value !== undefined && this.bindValue) {
    clone.value = this.value;
    clone.element[this.bindValue] = this.value;
  }

  if (this.attrs) {
    clone.attrs = { ...this.attrs };
  }

  if (this.styles) {
    clone.styles = { ...this.styles };
  }

  if (this.events) {
    clone.events = {};
    for (let type in this.events) {
      const handler = this.events[type];
      clone.element.addEventListener(type, handler);
      clone.events[type] = handler;
    }
  }

  return clone;
};

//////// wrappers

function addFileCSS(cssUrl) {
  HtmlElement.create({
    type: "link",
    attrs: {
      rel: "stylesheet",
      href: cssUrl,
    },
  }).appendTo(document.head);
}

function addFileJS(jsUrl) {
  HtmlElement.create({
    type: "script",
    attrs: {
      src: jsUrl,
      defer: "",
    },
  }).appendTo(document.head);
}
