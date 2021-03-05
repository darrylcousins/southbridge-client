(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("box-app.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

var _dom = require("@bikeshaving/crank/cjs/dom");

var _containerBox = _interopRequireDefault(require("./components/container-box"));

var _productBox = _interopRequireDefault(require("./components/product-box"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var init = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var productJson;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            productJson = JSON.parse(document.getElementById("product-json").textContent);

            if (!(productJson.type === "Container Box")) {
              _context.next = 6;
              break;
            }

            _context.next = 4;
            return _dom.renderer.render((0, _cjs.createElement)(_containerBox["default"], {
              productJson: productJson
            }), document.querySelector("#app"));

          case 4:
            _context.next = 12;
            break;

          case 6:
            if (!(productJson.type === "Box Produce")) {
              _context.next = 11;
              break;
            }

            _context.next = 9;
            return _dom.renderer.render((0, _cjs.createElement)(_productBox["default"], {
              productJson: productJson
            }), document.querySelector("#app"));

          case 9:
            _context.next = 12;
            break;

          case 11:
            return _context.abrupt("return");

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function init() {
    return _ref.apply(this, arguments);
  };
}(); // imported by initialize


var _default = {
  init: init
};
exports["default"] = _default;
});

require.register("collection.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("regenerator-runtime/runtime");

var _cjs = require("@bikeshaving/crank/cjs");

var _dom = require("@bikeshaving/crank/cjs/dom");

var _fetch = require("./components/fetch");

var _error = _interopRequireDefault(require("./components/error"));

var _barLoader = _interopRequireDefault(require("./components/bar-loader"));

var _selectMenu = _interopRequireDefault(require("./components/select-menu"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _marked = /*#__PURE__*/regeneratorRuntime.mark(BoxContent);

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function BoxContent(_ref) {
  var _this = this;

  var productJson, baseUrl, selectedDate, menuSelectDate, fetchError, loading, fetchJson, fetchDates, includedProducts, handleMouseUp, customizeBox, submitCart, init;
  return regeneratorRuntime.wrap(function BoxContent$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          productJson = _ref.productJson;

          /**
           * Base url to api
           *
           * @member baseUrl
           * @type {string}
           */
          baseUrl = "https://streamsidedev.cousinsd.net/api/";
          /**
           * The selected date after user select, one of fetchJson.keys
           *
           * @member selectedDate
           * @type {string}
           */

          /**
           * Display date selection menu if active
           *
           * @member menuSelectDate
           * @type {boolean}
           */
          menuSelectDate = false;
          /**
           * If fetching data was unsuccessful.
           *
           * @member fetchError
           * @type {object|string|null}
           */

          fetchError = null;
          /**
           * Display loading indicator while fetching data
           *
           * @member loading
           * @type {boolean}
           */

          loading = true;
          /**
           * Contains box data as collected from [api/current-boxes-by-product]{@link
           * module:api/current-boxes-by-product}. The data uses delivery date as keys to unsorted
           * array of box data.
           *
           * @member fetchJson
           * @type {object}
           */

          fetchJson = {};
          /**
           * Upcoming delivery dates
           *
           * @member fetchDates
           * @type {object}
           */

          fetchDates = [];
          /**
           * Included products - disregarding delivery date for now
           *
           * @member includedProducts
           * @type {object}
           */

          includedProducts = [];
          /**
           * Handle mouse up on selected components
           *
           * @function handleMouseUp
           * @param {object} ev The firing event
           * @listens click
           */

          handleMouseUp = function handleMouseUp(ev) {
            if (ev.target.tagName === "BUTTON") {
              switch (ev.target.id) {
                case "selectDate".concat(productJson.id):
                  menuSelectDate = !menuSelectDate;

                  _this.refresh();

                  break;
              }
            } else if (ev.target.tagName === "DIV") {
              switch (ev.target.getAttribute("name")) {
                case "selectDate".concat(productJson.id):
                  var date = ev.target.getAttribute("data-item");
                  selectedDate = date; //selectedBox = fetchJson[selectedDate];
                  // now seriously I need to update includedProducts
                  // and also check cart
                  //selectBox(date);

                  includedProducts = fetchJson[selectedDate].includedProducts;
                  menuSelectDate = false;

                  _this.refresh();

                  break;
              }
            }
          };

          this.addEventListener("mouseup", handleMouseUp);
          /**
           * Customize box clicked - reload page to box product
           *
           * @function customizeBox
           */

          customizeBox = function customizeBox() {
            var url = "".concat(productJson.url, "?").concat(Date.parse(selectedDate));

            if (typeof window.swup === 'undefined') {
              window.location = url;
            } else {
              window.swup.loadPage({
                url: url
              });
            }
          };
          /**
           * Submit cart data as made up from makeCart - also the callee
           * TODO this is the same as for container box!!
           * And so should be!
           *
           * @function submitCart
           */


          submitCart = /*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref2) {
              var cart, data, headers, src, _yield$PostFetch, error, json, url;

              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      cart = _ref2.cart;
                      data = {
                        id: fetchJson[selectedDate].shopify_variant_id,
                        quantity: 1,
                        properties: {
                          "Delivery Date": selectedDate,
                          "Including": includedProducts.join(',')
                        }
                      };
                      headers = {
                        "Content-Type": "application/json"
                      };
                      src = "/cart/add.js";
                      _context.next = 6;
                      return (0, _fetch.PostFetch)({
                        src: src,
                        data: data,
                        headers: headers
                      });

                    case 6:
                      _yield$PostFetch = _context.sent;
                      error = _yield$PostFetch.error;
                      json = _yield$PostFetch.json;
                      url = "/cart";

                      if (typeof window.swup === 'undefined') {
                        window.location = url;
                      } else {
                        window.swup.loadPage({
                          url: url
                        });
                      }

                    case 11:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            }));

            return function submitCart(_x) {
              return _ref3.apply(this, arguments);
            };
          }();
          /**
           * Gather box includes for display, watch for dates
           *
           * @function init
           */


          init = /*#__PURE__*/function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return (0, _fetch.Fetch)("".concat(baseUrl, "current-boxes-by-product/").concat(productJson.id)).then(function (_ref5) {
                        var error = _ref5.error,
                            json = _ref5.json;

                        if (error) {
                          fetchError = error;
                        } else {
                          if (Object.keys(json).length > 0) {
                            fetchDates = Object.keys(json); //includedProducts = json[fetchDates[0]].includedProducts.map(el => el.shopify_title.replace(/^- ?/, ""));

                            includedProducts = json[fetchDates[0]].includedProducts;
                            fetchJson = json;
                          }
                        }

                        loading = false;

                        _this.refresh();
                      });

                    case 2:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2);
            }));

            return function init() {
              return _ref4.apply(this, arguments);
            };
          }(); // get loaded


          init();

        case 14:
          if (!true) {
            _context3.next = 19;
            break;
          }

          _context3.next = 17;
          return (0, _cjs.createElement)(_cjs.Fragment, null, fetchError && (0, _cjs.createElement)(_error["default"], {
            msg: fetchError
          }), loading ? (0, _cjs.createElement)(_barLoader["default"], null) : (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)("div", {
            "class": "w-100 pv2"
          }, !includedProducts.length ? fetchDates.length ? (0, _cjs.createElement)("div", null, "Build your own box with available products.") : (0, _cjs.createElement)("div", null, "No boxes scheduled for delivery, we will post next week's boxes shortly. Please try again later.") : includedProducts.map(function (el) {
            return (0, _cjs.createElement)("a", {
              href: "/products/".concat(el.shopify_handle),
              "class": "link pointer o-90 fl f6 ph3 ma1 ba br-pill b--streamside-blue bg-transparent fg-streamside-blue"
            }, el.shopify_title);
          })), (0, _cjs.createElement)("div", {
            "class": "cf"
          }), fetchDates.length ? (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)("div", {
            "class": "relative w-100 pt3-ns cf"
          }, (0, _cjs.createElement)("div", {
            "class": selectedDate ? "w-100 w-third-ns fl" : "w-100 fl"
          }, (0, _cjs.createElement)(_selectMenu["default"], {
            id: "selectDate".concat(productJson.id),
            menu: fetchDates.map(function (el) {
              return {
                text: el,
                item: el
              };
            }),
            title: "Select Date",
            active: menuSelectDate
          }, selectedDate ? selectedDate : "Select delivery date", "\xA0\xA0\xA0\u25BE")), selectedDate && (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)("div", {
            "class": "w-100 w-third-ns fl pl1"
          }, (0, _cjs.createElement)("button", {
            type: "button",
            name: "add",
            "aria-label": "Add to cart",
            "class": "di f6 ttu w-100 tracked dim outline-0 debut-yellow b--debut-brown ba ba1 bg-debut-brown br2 pa2 mb1 pointer",
            onclick: submitCart
          }, "Add to cart")), (0, _cjs.createElement)("div", {
            "class": "w-100 w-third-ns fl pl1"
          }, (0, _cjs.createElement)("button", {
            type: "button",
            name: "customize",
            "aria-label": "Customize box",
            "class": "di f6 ttu w-100 tracked dim outline-0 debut-yellow b--debut-brown ba ba1 bg-debut-brown br2 pa2 mb1 pointer",
            onclick: customizeBox
          }, "Customize box"))))) : (0, _cjs.createElement)("div", null, "\xA0")));

        case 17:
          _context3.next = 14;
          break;

        case 19:
          ;

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, _marked, this);
}

var init = function init() {
  var content = document.querySelectorAll("p[name='box-content']");
  content.forEach( /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(el) {
      var json;
      return regeneratorRuntime.wrap(function _callee3$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              json = JSON.parse(el.parentNode.querySelector("script").textContent);
              _context4.next = 3;
              return _dom.renderer.render((0, _cjs.createElement)(BoxContent, {
                productJson: json
              }), el);

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x2) {
      return _ref6.apply(this, arguments);
    };
  }());
};

document.addEventListener("DOMContentLoaded", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
  return regeneratorRuntime.wrap(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee4);
}))); // imported by initialize

var _default = {
  init: init
};
exports["default"] = _default;
});

require.register("components/add-button.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _cjs = require("@bikeshaving/crank/cjs");

/** @jsx createElement */

/**
 * Add to cart button
 *
 * @author Darryl Cousins <darryljcousins@gmail.com>
 * @module app/addToCartButton
 */
function _default() {
  return (0, _cjs.createElement)("button", {
    type: "submit",
    name: "add",
    "aria-label": "Add to cart",
    "class": "product-form__cart-submit debut-yellow bg-debut-yellow br2",
    "data-add-to-cart": ""
  }, (0, _cjs.createElement)("span", {
    "data-add-to-cart-text": ""
  }, "Add to cart"), " ", (0, _cjs.createElement)("span", {
    "class": "dn",
    "data-loader": ""
  }, (0, _cjs.createElement)("svg", {
    "aria-hidden": "true",
    focusable: "false",
    role: "presentation",
    "class": "icon icon-spinner",
    viewbox: "0 0 20 20"
  }, (0, _cjs.createElement)("path", {
    d: "M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z",
    fill: "#919EAB"
  }))));
}
});

;require.register("components/animation-wrapper.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _awaitAsyncGenerator(value) { return new _AwaitValue(value); }

function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }

function _AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; var wrappedAwait = value instanceof _AwaitValue; Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) { if (wrappedAwait) { resume(key === "return" ? "return" : "next", arg); return; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen["return"] !== "function") { this["return"] = undefined; } }

if (typeof Symbol === "function" && Symbol.asyncIterator) { _AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; }

_AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };

_AsyncGenerator.prototype["throw"] = function (arg) { return this._invoke("throw", arg); };

_AsyncGenerator.prototype["return"] = function (arg) { return this._invoke("return", arg); };

function _AwaitValue(value) { this.wrapped = value; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

/**
 * Wrap a crank Component and provide animation functionality
 *
 * @function AnimationWrapper
 * @returns {Function} Return the wrapped component
 * @param {object} Component The component to be wrapped
 * @param {object} options Options for form and modal
 */
function AnimationWrapper(Component) {
  /**
   * Wrap a crank Component and provide animation functionality
   *
   * @function Wrapper
   * @yields {Element} Return the wrapped component
   * @param {object} props Property object
   */
  return /*#__PURE__*/function () {
    var _ref = _wrapAsyncGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(props) {
      var _this = this;

      var animationOptions, animateChildren, getChildren, animateMount, currentActive, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, _value;

      return regeneratorRuntime.wrap(function _callee4$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              animationOptions = {
                duration: 600,
                easing: "ease-in-out",
                fill: "both"
              };

              animateChildren = /*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(childs, targetHeight) {
                  var animation, style, matrix, matrixMatch, deltaY, Y;
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          childs.forEach(function (el) {
                            style = window.getComputedStyle(el);
                            matrix = style['transform'] || style.webkitTransform || style.mozTransform;
                            matrixMatch = matrix.match(/matrix.*\((.+)\)/);
                            Y = 0;

                            if (matrixMatch) {
                              Y = parseInt(matrixMatch[1].split(', ')[5], 10);
                            }

                            deltaY = targetHeight + Y;
                            animation = el.animate({
                              transformOrigin: "top left",
                              transform: "translateY(".concat(deltaY, "px)")
                            }, animationOptions);
                          });
                          return _context.abrupt("return", animation);

                        case 2:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }));

                return function animateChildren(_x2, _x3) {
                  return _ref2.apply(this, arguments);
                };
              }();

              getChildren = function getChildren(target) {
                var childs = []; // find all items that need to be animated out of the way
                // find next child as node
                //let nextChild = document.querySelector("#app").nextSibling;

                var nextChild = target.nextSibling;

                while (nextChild) {
                  if (nextChild.nodeName !== "#text") childs.push(nextChild);
                  nextChild = nextChild.nextSibling;
                }

                var wrapper = document.getElementById("wrapper-".concat(target.id));

                if (wrapper) {
                  nextChild = wrapper.nextSibling;

                  while (nextChild) {
                    if (nextChild.nodeName !== "#text") childs.push(nextChild);
                    nextChild = nextChild.nextSibling;
                  }
                }

                var app = document.getElementById("app");

                if (app) {
                  nextChild = app.nextSibling;

                  while (nextChild) {
                    if (nextChild.nodeName !== "#text") childs.push(nextChild);
                    nextChild = nextChild.nextSibling;
                  }

                  target.style.width = "".concat(app.clientWidth, "px");
                }

                var footer = document.getElementById("footer");
                if (footer) childs.push(footer);
                return childs;
              };

              animateMount = /*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(show, targetId) {
                  var target, childs, targetBox, targetHeight, animation, deltaY, style, matrix, matrixMatch, Y;
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          // now the component is in the dom
                          target = document.getElementById(targetId);
                          childs = getChildren(target);
                          targetBox = target.getBoundingClientRect(); // animate out of the way

                          targetHeight = parseInt(targetBox.height, 10);
                          ;
                          target.setAttribute("data-height", targetBox.height);

                          if (!show) {
                            _context2.next = 13;
                            break;
                          }

                          _context2.next = 9;
                          return animateChildren(childs, targetHeight);

                        case 9:
                          animation = _context2.sent;
                          animation.addEventListener("finish", function () {
                            target.animate({
                              opacity: 1
                            }, animationOptions);
                          });
                          _context2.next = 15;
                          break;

                        case 13:
                          // target has been removed from dom so move childs back to place
                          animation = target.animate({
                            opacity: 0
                          }, animationOptions); // how to ensure only move these with active object??? props change??

                          childs.forEach(function (el) {
                            style = window.getComputedStyle(el);
                            matrix = style['transform'] || style.webkitTransform || style.mozTransform;
                            matrixMatch = matrix.match(/matrix.*\((.+)\)/);
                            Y = 0;

                            if (matrixMatch) {
                              Y = parseInt(matrixMatch[1].split(', ')[5], 10);
                            }

                            deltaY = Y - targetHeight;
                            animation = el.animate({
                              transformOrigin: "top left",
                              transform: Y ? "translateY(".concat(deltaY, "px)") : "none"
                            }, animationOptions);
                          });

                        case 15:
                          ;

                        case 16:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

                return function animateMount(_x4, _x5) {
                  return _ref3.apply(this, arguments);
                };
              }();

              currentActive = props.isActive;
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _context5.prev = 7;
              _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                var props, awaitRender;
                return regeneratorRuntime.wrap(function _loop$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        awaitRender = function _awaitRender() {
                          if (!document.getElementById(props.componentId)) {
                            setTimeout(awaitRender, 100);
                          } else {
                            // wait another fraction to avoid flicker
                            setTimeout(function () {
                              return animateMount(props.isActive, props.componentId);
                            }, 100);
                          }
                        };

                        props = _value;

                        _this.schedule( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                          var div, dataHeight, oldHeight, currentHeight, childs, targetHeight;
                          return regeneratorRuntime.wrap(function _callee3$(_context3) {
                            while (1) {
                              switch (_context3.prev = _context3.next) {
                                case 0:
                                  // has the refresh changed size of the wrapped component??
                                  div = document.getElementById(props.componentId);

                                  if (!div) {
                                    _context3.next = 12;
                                    break;
                                  }

                                  dataHeight = div.getAttribute("data-height");
                                  if (dataHeight) oldHeight = parseInt(dataHeight, 10);
                                  currentHeight = div.getBoundingClientRect().height;

                                  if (!(dataHeight && oldHeight !== currentHeight && props.isActive)) {
                                    _context3.next = 12;
                                    break;
                                  }

                                  div.setAttribute("data-height", currentHeight);
                                  childs = getChildren(div);
                                  targetHeight = currentHeight - oldHeight;
                                  if (props.componentId === "productSelector") targetHeight += 30; // margins ??

                                  _context3.next = 12;
                                  return animateChildren(childs, targetHeight);

                                case 12:
                                case "end":
                                  return _context3.stop();
                              }
                            }
                          }, _callee3);
                        })));

                        _context4.next = 5;
                        return (0, _cjs.createElement)("div", {
                          id: "wrapper-".concat(props.componentId)
                        }, (0, _cjs.createElement)(Component, props));

                      case 5:
                        if (currentActive !== props.isActive) {
                          // only open on first round if true
                          // only make animation if changing view
                          awaitRender();
                        }

                        currentActive = props.isActive;

                      case 7:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _loop);
              });
              _iterator = _asyncIterator(this);

            case 10:
              _context5.next = 12;
              return _awaitAsyncGenerator(_iterator.next());

            case 12:
              _step = _context5.sent;
              _iteratorNormalCompletion = _step.done;
              _context5.next = 16;
              return _awaitAsyncGenerator(_step.value);

            case 16:
              _value = _context5.sent;

              if (_iteratorNormalCompletion) {
                _context5.next = 22;
                break;
              }

              return _context5.delegateYield(_loop(), "t0", 19);

            case 19:
              _iteratorNormalCompletion = true;
              _context5.next = 10;
              break;

            case 22:
              _context5.next = 28;
              break;

            case 24:
              _context5.prev = 24;
              _context5.t1 = _context5["catch"](7);
              _didIteratorError = true;
              _iteratorError = _context5.t1;

            case 28:
              _context5.prev = 28;
              _context5.prev = 29;

              if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
                _context5.next = 33;
                break;
              }

              _context5.next = 33;
              return _awaitAsyncGenerator(_iterator["return"]());

            case 33:
              _context5.prev = 33;

              if (!_didIteratorError) {
                _context5.next = 36;
                break;
              }

              throw _iteratorError;

            case 36:
              return _context5.finish(33);

            case 37:
              return _context5.finish(28);

            case 38:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee4, this, [[7, 24, 28, 38], [29,, 33, 37]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();
}

var _default = AnimationWrapper;
exports["default"] = _default;
});

require.register("components/bar-loader.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

/** @jsx createElement */

/**
 * Loading indicator module
 *
 * @module app/lib/bar-loader
 * @exports {Element} BarLoader
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Loader component
 *
 * @returns {Element} DOM component
 * @example
 * { loading && <BarLoader /> }
 */
var BarLoader = function BarLoader() {
  return (0, _cjs.createElement)("div", {
    "class": "progress-bar mt2"
  }, (0, _cjs.createElement)("span", {
    "class": "bar"
  }, (0, _cjs.createElement)("span", {
    "class": "progress"
  })));
};

var _default = BarLoader;
exports["default"] = _default;
});

require.register("components/container-box.bak.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("regenerator-runtime/runtime");

var _cjs = require("@bikeshaving/crank/cjs");

var _dom = require("@bikeshaving/crank/cjs/dom");

var _error = _interopRequireDefault(require("./error"));

var _barLoader = _interopRequireDefault(require("./bar-loader"));

var _quantityForm = _interopRequireDefault(require("./container/quantity-form"));

var _selectMenu = _interopRequireDefault(require("./select-menu"));

var _flash = _interopRequireDefault(require("./flash"));

var _fetch = require("./fetch");

var _lib = require("../lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _awaitAsyncGenerator(value) { return new _AwaitValue(value); }

function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }

function _AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; var wrappedAwait = value instanceof _AwaitValue; Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) { if (wrappedAwait) { resume(key === "return" ? "return" : "next", arg); return; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen["return"] !== "function") { this["return"] = undefined; } }

if (typeof Symbol === "function" && Symbol.asyncIterator) { _AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; }

_AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };

_AsyncGenerator.prototype["throw"] = function (arg) { return this._invoke("throw", arg); };

_AsyncGenerator.prototype["return"] = function (arg) { return this._invoke("return", arg); };

function _AwaitValue(value) { this.wrapped = value; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * BoxApp crank component
 *
 * @function BoxApp
 * @param {object} props The property object
 * @param {object} props.productJson Shopify product data as extracted from
 * product page json script tag
 * @returns {Element} A crank DOM component
 */

function ContainerBoxApp(_x) {
  return _ContainerBoxApp.apply(this, arguments);
}

function _ContainerBoxApp() {
  _ContainerBoxApp = _wrapAsyncGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(_ref) {
    var _this = this;

    var productJson, idMap, variantMap, fetchError, loading, flashMessage, fetchJson, fetchDates, baseUrl, selectedDate, selectedBox, selectedIncludes, possibleAddons, selectedExcludes, selectedAddons, editBoxActive, editBoxActiveComplete, menuSelectDate, menuAddItem, menuRemoveItem, modalQtyForm, priceElement, totalPrice, loadedFromCart, boxEditHeight, toPrice, getPrice, updatePriceElement, moveItem, loadBox, selectBox, handleChange, handleEditBoxActive, handleClick, handleMouseUp, fetchData, fetchCurrentDates, loadCart, fetchBox, fetchCart, submitCart, makeCart, d, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, _value2;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            productJson = _ref.productJson;

            /** 
             * Only required on developement site where id's don't match boxes - can be
             * updated once we can duplicated box mongo db
             */
            idMap = {
              // small
              "6163982876822": "5571286728870",
              // med
              "6163982975126": "5571286794406",
              // med fruit
              "6163982844054": "5576573878438",
              // med bread
              "6163982942358": "5577031352486",
              // big
              "6163982680214": "5571286696102",
              // custom
              "6163982647446": "5598426005670"
            };
            /** 
             * Only required on developement site where id's don't match boxes - can be
             * updated once we can duplicated box mongo db
             */

            variantMap = JSON.parse(document.querySelector("#variant-map").textContent);
            /**
             * If fetching data was unsuccessful.
             *
             * @member fetchError
             * @type {object|string|null}
             */

            fetchError = null;
            /**
             * Display loading indicator while fetching data
             *
             * @member loading
             * @type {boolean}
             */

            loading = true;
            /**
             * A message to the user - on 4s fade out
             *
             * @member flashMessage
             * @type {string}
             */

            flashMessage = "Please select a delivery date";
            /**
             * Contains box data as collected from [api/current-boxes-by-product]{@link
             * module:api/current-boxes-by-product}. The data uses delivery date as keys to unsorted
             * array of box data.
             *
             * @member fetchJson
             * @type {object}
             */

            fetchJson = {};
            /**
             * Contains array of current box dates duplicating fetchJson.keys
             *
             * @member fetchDates
             * @type {Array}
             */

            fetchDates = [];
            /**
             * Base url to api
             *
             * @member baseUrl
             * @type {string}
             */

            baseUrl = "https://streamsidedev.cousinsd.net/api/";
            /**
             * The selected date after user select, one of fetchJson.keys
             *
             * @member selectedDate
             * @type {string}
             */

            /**
             * Items included in the box, initially matches selectedBox.includedProducts unless pulling from cart data
             * but can be edited by the user
             *
             * @member selectedIncludes
             * @type {Array}
             */
            selectedIncludes = [];
            /**
             * Items that can be included in the box, initially matches selectedBox.addOnProducts unless pulling from cart data
             *
             * @member possibleAddons
             * @type {Array}
             */

            possibleAddons = [];
            /**
             * Items excluded from the box by the user - can only be items initially in selectedBox.includedProducts
             *
             * @member selectedExcludes
             * @type {Array}
             */

            selectedExcludes = [];
            /**
             * Items added to the box by the user, can only be items found in selectedBox.addOnProducts
             *
             * @member selectedAddons
             * @type {Array}
             */

            selectedAddons = [];
            /**
             * Show box customize options
             *
             * @member editBoxActive
             * @type {boolean}
             */

            /**
             * Display date selection menu if active
             *
             * @member menuSelectDate
             * @type {boolean}
             */
            menuSelectDate = false;
            /**
             * Display add product menu if active
             *
             * @member menuAddItem
             * @type {boolean}
             */

            menuAddItem = false;
            /**
             * Display remove product menu if active
             *
             * @member menuRemoveItem
             * @type {boolean}
             */

            menuRemoveItem = false;
            /**
             * Display edit quantities form modal
             *
             * @member modalQtyForm
             * @type {boolean}
             */

            modalQtyForm = false;
            /**
             * The price element - updated on change, and set after fetch
             *
             * @member priceElement
             * @type {Element}
             */

            /**
             * The total price TODO here in development udating on refresh - production
             * may actuall use priceElement as above
             *
             * @member priceElement
             * @type {Element}
             */
            totalPrice = productJson.variants[0].price;
            /**
             * Have we loaded data from an existing cart?
             *
             * @member loadedFromCart
             * @type {boolean} false
             */

            loadedFromCart = false;
            /**
             * Store height of the edit form to animate its display
             *
             * @member boxEditHeight
             * @type {number} 0
             */

            boxEditHeight = 0;
            /**
             * Make up a string price
             *
             * @param {number} num The integer number to use
             * @returns {string} Price string
             */

            toPrice = function toPrice(num) {
              return "$".concat((num * 0.01).toFixed(2));
            };
            /**
             * Figure the price for the element, if it's a standard included product only
             * extra quantities greater than one incur a price
             *
             * @param {object} el The target element
             * @param {boolean} includes Is this a standard included product?
             * @returns {string} Price string
             */


            getPrice = function getPrice(el, includes) {
              return toPrice(el.shopify_price * (includes ? el.quantity - 1 : el.quantity));
            };
            /**
             * Update priceElement on relevant changes
             *
             * @function updatePriceElement
             */


            updatePriceElement = function updatePriceElement() {
              var start = selectedBox.shopify_price;
              selectedIncludes.forEach(function (el) {
                if (el.quantity > 1) start += el.shopify_price * (el.quantity - 1);
              });
              selectedAddons.forEach(function (el) {
                start += el.shopify_price * el.quantity;
              });
              totalPrice = start; // ensure that this.refresh is called

              document.querySelector("#product-price").innerHTML = "$".concat((totalPrice * 0.01).toFixed(2));
            };
            /**
             * Move product between product lists of addon, excludes etc
             *
             * @function moveItem
             * @param id {number} The shopify_id of the product
             * @param from {array} The list to remove item from
             * @param to {array} The list to add the item to
             */


            moveItem = function moveItem(id, from, to) {
              var i;

              for (i = 0; i < from.length; i++) {
                if (from[i].shopify_id === id) {
                  to.push(from[i]);
                  from.splice(i, 1);
                }
              }

              updatePriceElement();
            };
            /**
             * Load the product items
             *
             * @function loadBox
             * @param date {string} The selected date
             */


            loadBox = function loadBox() {
              // may have upped the quantity of standard included product
              var checkLoadPresence = function checkLoadPresence(product) {
                var found = selectedIncludes.find(function (el) {
                  return el.shopify_variant_id === product.shopify_variant_id;
                });
                if (typeof found === "undefined") return false;
                return found;
              };

              selectedIncludes = selectedBox.includedProducts.map(function (el) {
                var item = _objectSpread({}, el);

                item.shopify_title = el.shopify_title.replace(/^- ?/, '');
                var found = checkLoadPresence(el);
                item.quantity = found ? found.quantity : 1;
                return item;
              });
              possibleAddons = selectedBox.addOnProducts.map(function (el) {
                var item = _objectSpread({}, el);

                item.shopify_title = el.shopify_title.replace(/^- ?/, '');
                item.quantity = 1;
                return item;
              }); // TODO find another smarter, cleaner way to do this. The purpose of this
              // algorithm is to match addons and excludes when switching between dates
              // and so is not done initially when loading cart data.
              // tmp arrays for filter tests

              var tmpIncludedIds = selectedIncludes.map(function (el) {
                return el.shopify_id;
              });
              var tmpAddonIds = possibleAddons.map(function (el) {
                return el.shopify_id;
              });
              selectedExcludes = selectedExcludes.filter(function (el) {
                return tmpIncludedIds.includes(el.shopify_id);
              });
              selectedAddons = selectedAddons.filter(function (el) {
                return tmpAddonIds.includes(el.shopify_id);
              }); // re-build tmp arrays

              tmpIncludedIds = selectedExcludes.map(function (el) {
                return el.shopify_id;
              });
              tmpAddonIds = selectedAddons.map(function (el) {
                return el.shopify_id;
              });
              selectedIncludes = selectedIncludes.filter(function (el) {
                return !tmpIncludedIds.includes(el.shopify_id);
              });
              possibleAddons = possibleAddons.filter(function (el) {
                return !tmpAddonIds.includes(el.shopify_id);
              });
              totalPrice = selectedBox.shopify_price;
            };
            /**
             * Set the selected box and set up product arrays, called after selecting
             * date.
             *
             * @function selectBox
             * @param date {string} The selected date
             */


            selectBox = /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(date) {
                var ts;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        selectedDate = date;

                        if (hasOwnProp.call(fetchJson, selectedDate)) {
                          _context.next = 9;
                          break;
                        }

                        loading = false;

                        _this.refresh();

                        ts = new Date(date).getTime();
                        _context.next = 7;
                        return (0, _fetch.Fetch)("".concat(baseUrl, "box-by-date-and-product/").concat(idMap[productJson.id], "/").concat(ts)).then(function (_ref3) {
                          var error = _ref3.error,
                              json = _ref3.json;

                          if (error) {
                            fetchError = error;
                          } else {
                            fetchJson[selectedDate] = json;
                            selectedBox = fetchJson[selectedDate];
                            loadBox();
                          }

                          loading = false;

                          _this.refresh();
                        });

                      case 7:
                        _context.next = 12;
                        break;

                      case 9:
                        selectedBox = fetchJson[selectedDate];
                        loadBox();

                        _this.refresh();

                      case 12:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function selectBox(_x2) {
                return _ref2.apply(this, arguments);
              };
            }();
            /**
             * Handle change on selected input elements
             *
             * @function handleChange
             * @param {object} ev The firing event
             * @listens change
             */


            handleChange = function handleChange(ev) {
              if (ev.target.tagName === "INPUT") {
                if (ev.target.name === "quantity") {
                  switch (ev.target.getAttribute("data-id")) {
                    case "includes":
                      selectedIncludes.forEach(function (el) {
                        if (el.shopify_id === ev.target.id) {
                          if (parseInt(ev.target.value) === 0) {
                            el.quantity = 1;
                            flashMessage = "".concat(el.shopify_title, " removed.");
                            moveItem(el.shopify_id, selectedIncludes, selectedExcludes);
                          } else {
                            el.quantity = ev.target.value;
                            flashMessage = "".concat(el.shopify_title, " quantity changed to ").concat(el.quantity, ".");
                          }
                        }
                      });
                      break;

                    case "addons":
                      selectedAddons.forEach(function (el) {
                        if (el.shopify_id === ev.target.id) {
                          if (parseInt(ev.target.value) === 0) {
                            el.quantity = 1;
                            flashMessage = "Add on ".concat(el.shopify_title, " removed.");
                            moveItem(el.shopify_id, selectedAddons, possibleAddons);
                          } else {
                            el.quantity = ev.target.value;
                            flashMessage = "".concat(el.shopify_title, " quantity changed to ").concat(el.quantity, ".");
                          }
                        }
                      });
                      break;
                  }

                  updatePriceElement();

                  _this.refresh();
                }
              }
            };

            this.addEventListener("change", handleChange);
            /**
             * Set up edit box either when page loaded from collection and choosing to
             * edit box or after selecting checkbox
             *
             * @function handleEditBoxActive
             */

            handleEditBoxActive = /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(ev) {
                var boxEdit, description, footer, addButton, boxEditRect, deltaY, animation, keyFrames;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        boxEdit = document.getElementById("container-box-edit");
                        description = document.querySelector("#product-description");
                        footer = document.querySelector("#footer");
                        addButton = document.querySelector("#add-button");

                        if (boxEdit) {
                          boxEdit.style.width = "".concat(description.clientWidth, "px");
                          boxEditRect = boxEdit.getBoundingClientRect();
                          boxEditHeight = boxEditRect.height;
                        }

                        ;
                        console.log('no box here', boxEdit); // animate out of the way

                        deltaY = boxEditHeight;
                        keyFrames = {
                          duration: 600,
                          easing: "ease-in-out",
                          fill: "both"
                        };

                        if (boxEdit) {
                          [description, footer, addButton].forEach(function (el) {
                            animation = el.animate([{
                              transformOrigin: "top left",
                              transform: "translate(0px, ".concat(deltaY, "px)")
                            }], keyFrames);
                            animation.addEventListener("finish", function () {
                              boxEdit.classList.add("transition-fade");
                            });
                          });
                        } else {
                          [description, footer, addButton].forEach(function (el) {
                            animation = el.animate([{
                              transformOrigin: "top left",
                              transform: "none"
                            }], keyFrames);
                          });
                        }

                        ;

                      case 11:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function handleEditBoxActive(_x3) {
                return _ref4.apply(this, arguments);
              };
            }();
            /**
             * Handle click event on selected elements
             *
             * @function handleClick
             * @param {object} ev The firing event
             * @listens click
             */


            handleClick = /*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(ev) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        if (!(ev.target.tagName === "INPUT")) {
                          _context3.next = 7;
                          break;
                        }

                        if (!(ev.target.type === "checkbox" && ev.target.id === "toggleEditBox")) {
                          _context3.next = 7;
                          break;
                        }

                        if (!editBoxActiveComplete === null) editBoxActiveComplete = null;
                        editBoxActive = !editBoxActive;
                        _context3.next = 6;
                        return _this.refresh();

                      case 6:
                        handleEditBoxActive();

                      case 7:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function handleClick(_x4) {
                return _ref5.apply(this, arguments);
              };
            }();

            this.addEventListener("click", handleClick);
            /**
             * Handle mouse up on selected components
             *
             * @function handleMouseUp
             * @param {object} ev The firing event
             * @listens click
             */

            handleMouseUp = function handleMouseUp(ev) {
              if (ev.target.tagName === "BUTTON") {
                switch (ev.target.id) {
                  case "selectDate":
                    menuSelectDate = !menuSelectDate;
                    modalQtyForm = menuRemoveItem = menuAddItem = false;

                    _this.refresh();

                    break;

                  case "removeItem":
                    menuRemoveItem = !menuRemoveItem;
                    modalQtyForm = menuSelectDate = menuAddItem = false;

                    _this.refresh();

                    break;

                  case "addItem":
                    menuAddItem = !menuAddItem;
                    modalQtyForm = menuRemoveItem = menuSelectDate = false;

                    _this.refresh();

                    break;

                  case "qtyForm":
                    modalQtyForm = !modalQtyForm;
                    menuSelectDate = menuRemoveItem = menuSelectDate = false;

                    _this.refresh();

                    break;

                  case "qtyFormClose":
                    modalQtyForm = false;

                    _this.refresh();

                    break;
                }
              } else if (ev.target.tagName === "DIV") {
                switch (ev.target.getAttribute("name")) {
                  case "selectDate":
                    var date = ev.target.getAttribute("data-item");

                    if (typeof selectedDate === 'undefined') {
                      flashMessage = "Delivery date chosen ".concat(date);
                    } else {
                      flashMessage = "Delivery date changed to ".concat(date);
                    }

                    selectBox(date);
                    menuSelectDate = false;

                    _this.refresh();

                    break;

                  case "removeItem":
                    flashMessage = "".concat(ev.target.getAttribute("data-title"), " removed.");
                    moveItem(ev.target.getAttribute("data-item"), selectedIncludes, selectedExcludes);
                    menuRemoveItem = false;

                    _this.refresh();

                    break;

                  case "addItem":
                    flashMessage = "".concat(ev.target.getAttribute("data-title"), " added.");
                    moveItem(ev.target.getAttribute("data-item"), possibleAddons, selectedAddons);
                    menuAddItem = false;

                    _this.refresh();

                    break;

                  case "selectedAddon":
                    flashMessage = "Add on ".concat(ev.target.getAttribute("data-title"), " removed.");
                    moveItem(ev.target.getAttribute("data-item"), selectedAddons, possibleAddons);

                    _this.refresh();

                    break;

                  case "selectedExclude":
                    flashMessage = "".concat(ev.target.getAttribute("data-title"), " added back.");
                    moveItem(ev.target.getAttribute("data-item"), selectedExcludes, selectedIncludes);

                    _this.refresh();

                    break;
                }
              }
            };

            this.addEventListener("mouseup", handleMouseUp);
            /**
             * Uses fetch to collect current boxes from api and then refreshs `this`
             * (Called as soon as the element is mounted.)
             *
             * @function fetchData
             */

            fetchData = /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var fetchUrl, _yield$Fetch, error, json;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        fetchUrl = "".concat(baseUrl, "current-boxes-by-product/").concat(idMap[productJson.id]);
                        _context4.next = 3;
                        return (0, _fetch.Fetch)(fetchUrl);

                      case 3:
                        _yield$Fetch = _context4.sent;
                        error = _yield$Fetch.error;
                        json = _yield$Fetch.json;

                        if (error) {
                          fetchError = error;
                        } else {
                          fetchJson = json;
                          fetchDates = Object.keys(fetchJson); // if only one bypass the date select

                          if (fetchDates.length === 1) {
                            selectBox(fetchDates[0]); // be wary - do we need to refresh component?

                            flashMessage = "";
                          }
                        }

                        loading = false;

                        _this.refresh();

                      case 9:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function fetchData() {
                return _ref6.apply(this, arguments);
              };
            }();
            /**
             * Uses fetch to collect current dates from api
             *
             * @function fetchCurrentDates
             */


            fetchCurrentDates = /*#__PURE__*/function () {
              var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                var fetchUrl, _yield$Fetch2, error, json;

                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        fetchUrl = "".concat(baseUrl, "current-box-dates");
                        _context5.next = 3;
                        return (0, _fetch.Fetch)(fetchUrl);

                      case 3:
                        _yield$Fetch2 = _context5.sent;
                        error = _yield$Fetch2.error;
                        json = _yield$Fetch2.json;

                        if (error) {
                          fetchError = error;
                        } else {
                          fetchDates = json;

                          if (fetchDates.length === 1) {
                            selectBox(fetchDates[0]); // this causes a flicket because drop down already rendered

                            flashMessage = "";
                          }
                        }

                        loading = false; //this.refresh();

                      case 8:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5);
              }));

              return function fetchCurrentDates() {
                return _ref7.apply(this, arguments);
              };
            }();
            /**
             * Load current cart if cart.items.length - called from `fetchCart` which is caalled immdiately the component loads
             */


            loadCart = /*#__PURE__*/function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(cart) {
                var _cart$items$filter, _cart$items$filter2, box;

                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        // product_type from liquid object would be (?) cart.items[x].product.type
                        _cart$items$filter = cart.items.filter(function (el) {
                          return el.product_type === "Container Box";
                        }), _cart$items$filter2 = _slicedToArray(_cart$items$filter, 1), box = _cart$items$filter2[0];
                        selectedDate = box.properties["Delivery Date"]; // loading dates can happen asynchronously to loading selected box

                        _context6.next = 4;
                        return (0, _fetch.Fetch)("".concat(baseUrl, "current-box-dates")).then(function (_ref9) {
                          var error = _ref9.error,
                              json = _ref9.json;

                          if (error) {
                            fetchError = error;
                          } else {
                            fetchDates = json;
                          }

                          _this.refresh();
                        });

                      case 4:
                        fetchBox({
                          box: box,
                          cart: cart
                        });

                      case 5:
                      case "end":
                        return _context6.stop();
                    }
                  }
                }, _callee6);
              }));

              return function loadCart(_x5) {
                return _ref8.apply(this, arguments);
              };
            }();
            /**
             * Uses fetch to collect current cart for the session 
             *
             * @function fetchBox
             */


            fetchBox = /*#__PURE__*/function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(_ref10) {
                var box, cart, ts;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        box = _ref10.box, cart = _ref10.cart;

                        if (selectedDate) {
                          _context7.next = 4;
                          break;
                        }

                        console.warn("Calling loadBox with no selectedDate");
                        return _context7.abrupt("return");

                      case 4:
                        ;
                        ts = new Date(selectedDate).getTime();
                        _context7.next = 8;
                        return (0, _fetch.Fetch)("".concat(baseUrl, "box-by-date-and-product/").concat(idMap[productJson.id], "/").concat(ts)).then(function (_ref12) {
                          var error = _ref12.error,
                              json = _ref12.json;

                          if (error) {
                            fetchError = error;
                          } else {
                            fetchJson[selectedDate] = json;
                            selectedBox = fetchJson[selectedDate];
                            var removedItems = box ? box.properties["Removed Items"].split(',').map(function (el) {
                              return el.trim();
                            }) : []; // get the excluded items

                            selectedExcludes = selectedBox.includedProducts.filter(function (el) {
                              return removedItems.includes(el.shopify_title);
                            });

                            var checkPresence = function checkPresence(product) {
                              if (!cart) return false;
                              var found = cart.items.find(function (el) {
                                return el.variant_id === product.shopify_variant_id;
                              });
                              if (typeof found === "undefined") return false;
                              return found;
                            }; // get the included box items filtering out those already excluded if loaded from cart


                            selectedIncludes = selectedBox.includedProducts.filter(function (el) {
                              return !removedItems.includes(el.shopify_title);
                            }).map(function (el) {
                              var item = _objectSpread({}, el);

                              item.shopify_title = el.shopify_title.replace(/^- ?/, '');
                              var found = checkPresence(el);
                              item.quantity = found ? found.quantity + 1 : 1;
                              return item;
                            }); // get the addon products and their quantity if loaded from cart

                            selectedAddons = selectedBox.addOnProducts.filter(function (el) {
                              return checkPresence(el);
                            }).map(function (el) {
                              var item = _objectSpread({}, el);

                              item.shopify_title = el.shopify_title.replace(/^- ?/, '');
                              var found = checkPresence(el);
                              item.quantity = found.quantity;
                              return item;
                            }); // get defined possible addons filtering out those that have been added o the cart

                            possibleAddons = selectedBox.addOnProducts.filter(function (el) {
                              return !checkPresence(el);
                            }).map(function (el) {
                              var item = _objectSpread({}, el);

                              item.shopify_title = el.shopify_title.replace(/^- ?/, '');
                              item.quantity = 1;
                              return item;
                            });
                          }

                          loading = false;
                          updatePriceElement();
                          flashMessage = "Loaded box from your cart";
                          loadedFromCart = true;

                          _this.refresh();
                        });

                      case 8:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7);
              }));

              return function fetchBox(_x6) {
                return _ref11.apply(this, arguments);
              };
            }();
            /**
             * Uses fetch to collect current cart for the session 
             *
             * @function fetchCart
             */


            fetchCart = /*#__PURE__*/function () {
              var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
                var _yield$Fetch3, error, json;

                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return (0, _fetch.Fetch)("/cart.js");

                      case 2:
                        _yield$Fetch3 = _context8.sent;
                        error = _yield$Fetch3.error;
                        json = _yield$Fetch3.json;

                        if (!error) {
                          _context8.next = 10;
                          break;
                        }

                        fetchError = error;

                        _this.refresh();

                        _context8.next = 13;
                        break;

                      case 10:
                        if (json.items) {
                          _context8.next = 12;
                          break;
                        }

                        throw "Failed to load cart data";

                      case 12:
                        if (json.items.length === 0) {
                          fetchCurrentDates();
                        } else {
                          loadCart(json);
                        }

                      case 13:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8);
              }));

              return function fetchCart() {
                return _ref13.apply(this, arguments);
              };
            }();
            /**
             * Submit cart data as made up from makeCart - also the callee
             *
             */


            submitCart = /*#__PURE__*/function () {
              var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(_ref14) {
                var cart, data, headers, src, _yield$PostFetch, error, json, url;

                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        cart = _ref14.cart;
                        data = {
                          items: cart.items.map(function (item) {
                            return {
                              id: variantMap[item.variant_id],
                              quantity: item.quantity,
                              properties: item.properties
                            };
                          })
                        };
                        headers = {
                          "Content-Type": "application/json"
                        };
                        src = "/cart/add.js";
                        _context9.next = 6;
                        return (0, _fetch.PostFetch)({
                          src: src,
                          data: data,
                          headers: headers
                        });

                      case 6:
                        _yield$PostFetch = _context9.sent;
                        error = _yield$PostFetch.error;
                        json = _yield$PostFetch.json;
                        url = "/cart";

                        if (typeof window.swup === 'undefined') {
                          window.location = url;
                        } else {
                          window.swup.loadPage({
                            url: url
                          });
                        }

                      case 11:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee9);
              }));

              return function submitCart(_x7) {
                return _ref15.apply(this, arguments);
              };
            }();
            /**
             * Make up cart data for submission. Doing this is a simple as submitting to
             * cart/add.js with an array of items
             *
             * TODO: Not in necessary - could call submitCart directly - see collection.js for example
             *
             */


            makeCart = function makeCart() {
              var cart = {};
              cart.total_price = totalPrice;

              var makeTitle = function makeTitle(el) {
                var title = el.shopify_title;

                if (el.quantity > 1) {
                  title = "".concat(title, " (").concat(el.quantity, ")");
                }

                return title;
              };

              cart.items = []; // first item is the box itself

              cart.items.push({
                quantity: 1,
                title: selectedBox.shopify_title,
                product_id: selectedBox.shopify_product_id,
                variant_id: selectedBox.shopify_variant_id,
                handle: selectedBox.shopify_handle,
                product_type: "Container Box",
                properties: {
                  "Delivery Date": selectedDate,
                  "Including": selectedIncludes.map(function (el) {
                    return makeTitle(el);
                  }).join(),
                  "Removed Items": selectedExcludes.map(function (el) {
                    return el.shopify_title;
                  }).join() //"Add on Items": selectedAddons.map(el => makeTitle(el)).join()

                }
              }); // following that are any addon items

              selectedAddons.forEach(function (el) {
                cart.items.push({
                  quantity: el.quantity,
                  title: el.shopify_title,
                  product_id: el.shopify_product_id,
                  variant_id: el.shopify_variant_id,
                  handle: el.shopify_handle,
                  product_type: "Box Produce",
                  properties: {
                    "Delivery Date": selectedDate,
                    "Add on product to": selectedBox.shopify_title
                  }
                });
              }); // following that are any addon items that are already included in box but are extras

              selectedIncludes.forEach(function (el) {
                if (el.quantity > 1) {
                  cart.items.push({
                    quantity: el.quantity - 1,
                    title: el.shopify_title,
                    product_id: el.shopify_product_id,
                    variant_id: el.shopify_variant_id,
                    handle: el.shopify_handle,
                    product_type: "Box Produce",
                    properties: {
                      "Delivery Date": selectedDate,
                      "Add on product to": selectedBox.shopify_title
                    }
                  });
                }
              }); // this is of the same structure as a fetched cart

              submitCart({
                cart: cart
              });
            };

            fetchCart(); // the first thing to happem

            if (window.location.search) {
              // we have a selected date coming for the collection - TODO check for cart or handle from the collection
              d = new Date(parseInt(window.location.search.slice(1)));
              selectedDate = d.toDateString();
              editBoxActive = true;
              editBoxActiveComplete = true;
              fetchBox({
                box: null,
                cart: null
              }); // fails because element not yet rendered
              //handleEditBoxActive(); // run the algorithm to display edit options
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context10.prev = 44;
            _iterator = _asyncIterator(this);

          case 46:
            _context10.next = 48;
            return _awaitAsyncGenerator(_iterator.next());

          case 48:
            _step = _context10.sent;
            _iteratorNormalCompletion = _step.done;
            _context10.next = 52;
            return _awaitAsyncGenerator(_step.value);

          case 52:
            _value = _context10.sent;

            if (_iteratorNormalCompletion) {
              _context10.next = 61;
              break;
            }

            _value2 = _value;
            productJson = _value2.productJson;
            _context10.next = 58;
            return (0, _cjs.createElement)("div", {
              "class": "mt2 sans-serif",
              id: "container-box"
            }, fetchError && (0, _cjs.createElement)(_error["default"], {
              msg: fetchError
            }), !loading ? (0, _cjs.createElement)(_cjs.Fragment, null, flashMessage && (0, _cjs.createElement)(_flash["default"], null, flashMessage), fetchDates.length > 0 ? (0, _cjs.createElement)(_cjs.Fragment, null, !selectedDate && (0, _cjs.createElement)("div", {
              "class": "warn fg-warn br2 w-100 ba pa1 mb2 tc"
            }, (0, _cjs.createElement)("span", {
              "class": "f3 b pr1"
            }, "!"), "Please choose a date for delivery"), (0, _cjs.createElement)("div", {
              "class": "relative"
            }, (0, _cjs.createElement)(_selectMenu["default"], {
              id: "selectDate",
              menu: fetchDates.map(function (el) {
                return {
                  text: el,
                  item: el
                };
              }),
              title: "Select Date",
              active: menuSelectDate
            }, selectedDate ? selectedDate : "Select delivery date", "\xA0\xA0\xA0\u25BE"))) : (0, _cjs.createElement)("div", {
              "class": "warn fg-warn br2 w-100 ba pa1 mb2 tc"
            }, (0, _cjs.createElement)("span", {
              "class": "f3 b pr1"
            }, "!"), "No boxes scheduled for delivery, please come back later."), selectedBox && (0, _cjs.createElement)(_cjs.Fragment, null, modalQtyForm && (0, _cjs.createElement)(_quantityForm["default"], {
              includes: selectedIncludes,
              addons: selectedAddons,
              totalPrice: totalPrice
            }), (0, _cjs.createElement)("div", {
              "class": "ttu b pt2"
            }, "Box Products"), (0, _cjs.createElement)("div", {
              "class": "w-100 bb b--silver pv2 fl cf"
            }, selectedIncludes.map(function (el) {
              return (0, _cjs.createElement)("div", {
                "class": "fl f6 ph3 ma1 ba br-pill b--streamside-blue bg-streamside-blue white"
              }, el.shopify_title, " ", el.quantity > 1 ? "(".concat(el.quantity, ") ").concat(getPrice(el, true)) : "");
            }), selectedAddons.map(function (el) {
              return (0, _cjs.createElement)("div", {
                "class": "fl f6 ph3 ma1 ba br-pill b--streamside-maroon bg-streamside-maroon white pointer",
                name: "selectedAddon",
                "data-item": el.shopify_id,
                "data-title": el.shopify_title
              }, el.shopify_title, " (", el.quantity, ") ", getPrice(el), " \u2718");
            })), (0, _cjs.createElement)("div", {
              "class": "cf"
            }), selectedExcludes.length ? (0, _cjs.createElement)("div", {
              "class": "cf"
            }, (0, _cjs.createElement)("div", {
              "class": "ttu b"
            }, "Excluded Products"), (0, _cjs.createElement)("div", {
              "class": "fw1 f6 gray"
            }, "A suprise item will be substitued"), (0, _cjs.createElement)("div", {
              "class": "w-100 bb b--silver pv2 fl"
            }, selectedExcludes.map(function (el) {
              return (0, _cjs.createElement)("div", {
                "class": "fl f6 ph3 ma1 ba br-pill b--streamside-orange bg-streamside-orange white pointer",
                name: "selectedExclude",
                "data-item": el.shopify_id,
                "data-title": el.shopify_title
              }, el.shopify_title, " \u2718");
            }))) : "", (0, _cjs.createElement)("div", {
              "class": "w-100 pv3 gray dt"
            }, (0, _cjs.createElement)("div", {
              "class": "dtc"
            }, (0, _cjs.createElement)("input", {
              "class": "b--silver mr2",
              type: "checkbox",
              id: "toggleEditBox",
              checked: editBoxActive
            }), (0, _cjs.createElement)("label", {
              "for": "toggleEditBox",
              htmlFor: "toggleEditBox"
            }, "Customize your box")), (0, _cjs.createElement)("div", {
              "class": "dtc"
            }, (0, _cjs.createElement)("div", {
              "class": "tr"
            }, (0, _cjs.createElement)("button", {
              "class": "f6 outline-0 gray b--gray ba ba1 bg-transparent br2 pa1 mb1 pointer",
              title: "Change product quantities",
              id: "qtyForm",
              type: "button"
            }, "Change quantities"))))), selectedBox && editBoxActive && (0, _cjs.createElement)("div", {
              "class": "".concat(!editBoxActiveComplete && "absolute o-0", " w-100"),
              id: "container-box-edit"
            }, (0, _cjs.createElement)("div", null, selectedIncludes.length > 0 && (0, _cjs.createElement)(_selectMenu["default"], {
              id: "removeItem",
              menu: selectedIncludes.map(function (el) {
                return {
                  text: el.shopify_title,
                  item: el.shopify_id
                };
              }),
              title: "Remove items from your box",
              active: menuRemoveItem
            }, "Select items you'd prefer not to receive\xA0\xA0\xA0\u25BE"), possibleAddons.length > 0 && (0, _cjs.createElement)(_selectMenu["default"], {
              id: "addItem",
              menu: possibleAddons.map(function (el) {
                return {
                  text: el.shopify_title,
                  item: el.shopify_id
                };
              }),
              title: "Add items to your box",
              active: menuAddItem
            }, "Select items you'd like to add to the box\xA0\xA0\xA0\u25BE")), (0, _cjs.createElement)("div", {
              "class": "ttu b pt2"
            }, "Available Products"), (0, _cjs.createElement)("div", {
              "class": "bb b--silver pv2 fl"
            }, possibleAddons.map(function (el) {
              return (0, _cjs.createElement)("div", {
                "class": "fl f6 ph3 ma1 ba br-pill b--streamside-maroon bg-streamside-maroon white"
              }, el.shopify_title, " ", getPrice(el));
            })), (0, _cjs.createElement)("div", {
              "class": "cf"
            })), selectedDate && (0, _cjs.createElement)("button", {
              type: "submit",
              name: "add",
              id: "add-button",
              "aria-label": "Add to cart",
              "class": "f6 ttu w-100 tracked dim outline-0 debut-yellow b--debut-brown ba ba1 bg-debut-brown br2 pa2 mb1 pointer",
              "data-add-to-cart": "",
              onclick: makeCart
            }, (0, _cjs.createElement)("span", {
              "data-add-to-cart-text": ""
            }, loadedFromCart ? "Update selection" : "Add to cart"), " ", (0, _cjs.createElement)("span", {
              "class": "dn",
              "data-loader": ""
            }, (0, _cjs.createElement)("svg", {
              "aria-hidden": "true",
              focusable: "false",
              role: "presentation",
              "class": "icon icon-spinner",
              viewbox: "0 0 20 20"
            }, (0, _cjs.createElement)("path", {
              d: "M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z",
              fill: "#919EAB"
            }))))) : (0, _cjs.createElement)(_barLoader["default"], null));

          case 58:
            _iteratorNormalCompletion = true;
            _context10.next = 46;
            break;

          case 61:
            _context10.next = 67;
            break;

          case 63:
            _context10.prev = 63;
            _context10.t0 = _context10["catch"](44);
            _didIteratorError = true;
            _iteratorError = _context10.t0;

          case 67:
            _context10.prev = 67;
            _context10.prev = 68;

            if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
              _context10.next = 72;
              break;
            }

            _context10.next = 72;
            return _awaitAsyncGenerator(_iterator["return"]());

          case 72:
            _context10.prev = 72;

            if (!_didIteratorError) {
              _context10.next = 75;
              break;
            }

            throw _iteratorError;

          case 75:
            return _context10.finish(72);

          case 76:
            return _context10.finish(67);

          case 77:
            ;

          case 78:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this, [[44, 63, 67, 77], [68,, 72, 76]]);
  }));
  return _ContainerBoxApp.apply(this, arguments);
}

var _default = ContainerBoxApp;
exports["default"] = _default;
});

require.register("components/container-box.first-animate.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("regenerator-runtime/runtime");

var _cjs = require("@bikeshaving/crank/cjs");

var _dom = require("@bikeshaving/crank/cjs/dom");

var _error = _interopRequireDefault(require("./error"));

var _barLoader = _interopRequireDefault(require("./bar-loader"));

var _quantityForm = _interopRequireDefault(require("./container/quantity-form"));

var _selectMenu = _interopRequireDefault(require("./select-menu"));

var _flash = _interopRequireDefault(require("./flash"));

var _animationWrapper = _interopRequireDefault(require("./animation-wrapper"));

var _fetch = require("./fetch");

var _lib = require("../lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _awaitAsyncGenerator(value) { return new _AwaitValue(value); }

function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }

function _AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; var wrappedAwait = value instanceof _AwaitValue; Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) { if (wrappedAwait) { resume(key === "return" ? "return" : "next", arg); return; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen["return"] !== "function") { this["return"] = undefined; } }

if (typeof Symbol === "function" && Symbol.asyncIterator) { _AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; }

_AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };

_AsyncGenerator.prototype["throw"] = function (arg) { return this._invoke("throw", arg); };

_AsyncGenerator.prototype["return"] = function (arg) { return this._invoke("return", arg); };

function _AwaitValue(value) { this.wrapped = value; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var Paragraph = function Paragraph() {
  return (0, _cjs.createElement)("p", {
    id: "myText",
    "class": "absolute o-0 tl lh-copy black-60 mh0 mv2"
  }, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
};

var TextParagraph = (0, _animationWrapper["default"])(Paragraph);
/**
 * ContainerBoxApp crank component
 *
 * @generator ContainerBoxApp
 * @param {object} props The property object
 * @param {object} props.productJson Shopify product data as extracted from
 * product page json script tag
 * @yields {Element} A crank DOM component
 */

function ContainerBoxApp(_x) {
  return _ContainerBoxApp.apply(this, arguments);
}

function _ContainerBoxApp() {
  _ContainerBoxApp = _wrapAsyncGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref) {
    var _this = this;

    var productJson, idMap, fetchError, loading, baseUrl, fetchJson, fetchDates, editBoxActive, cartJson, handleEditBoxActive, getData, handleClick, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, _value2;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            productJson = _ref.productJson;

            /**
             * Only required on developement site where id's don't match boxes - can be
             * updated once we can duplicated box mongo db
             */
            idMap = {
              // small
              6163982876822: "5571286728870",
              // med
              6163982975126: "5571286794406",
              // med fruit
              6163982844054: "5576573878438",
              // med bread
              6163982942358: "5577031352486",
              // big
              6163982680214: "5571286696102",
              // custom
              6163982647446: "5598426005670"
            };
            /**
             * If fetching data was unsuccessful.
             *
             * @member fetchError
             * @type {object|string|null}
             */

            fetchError = null;
            /**
             * Display loading indicator while fetching data
             *
             * @member loading
             * @type {boolean}
             */

            loading = true;
            /**
             * Base url to api
             *
             * @member baseUrl
             * @type {string}
             */

            baseUrl = "https://streamsidedev.cousinsd.net/api/";
            /**
             * Contains box data as collected from [api/current-boxes-by-product]{@link
             * module:api/current-boxes-by-product}. The data uses delivery date as keys to unsorted
             * array of box data.
             *
             * @member fetchJson
             * @type {object}
             */

            fetchJson = {};
            /**
             * Upcoming delivery dates
             *
             * @member fetchDates
             * @type {object}
             */

            fetchDates = [];
            /**
             * Show box customize options
             *
             * @member editBoxActive
             * @type {boolean}
             */

            _context4.next = 9;
            return _awaitAsyncGenerator(JSON.parse(document.querySelector("#cart-json").textContent));

          case 9:
            cartJson = _context4.sent;

            handleEditBoxActive = /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(show) {
                var targetId, target, childs, nextChild, app, footer, options, targetBox, deltaY, animation, childanimation;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        console.log(editBoxActive);

                        if (!show) {
                          _context.next = 5;
                          break;
                        }

                        _context.next = 4;
                        return _this.refresh();

                      case 4:
                        console.log('refreshing yes'); // when unmounting component do this last!!

                      case 5:
                        targetId = "myText"; // now the component is in the dom

                        target = document.getElementById(targetId);
                        console.log(target);
                        childs = []; // find all items that need to be animated out of the way
                        // find next child as node
                        //let nextChild = document.querySelector("#app").nextSibling;

                        nextChild = target.nextSibling;

                        while (nextChild) {
                          if (nextChild.nodeName !== "#text") childs.push(nextChild);
                          nextChild = nextChild.nextSibling;
                        }

                        app = document.getElementById("app");
                        nextChild = app.nextSibling;

                        while (nextChild) {
                          if (nextChild.nodeName !== "#text") childs.push(nextChild);
                          nextChild = nextChild.nextSibling;
                        }

                        footer = document.getElementById("footer");
                        if (footer) childs.push(footer); // set width to app width

                        target.style.width = "".concat(app.clientWidth, "px");
                        options = {
                          duration: 600,
                          easing: "ease-in-out",
                          fill: "both"
                        };
                        targetBox = target.getBoundingClientRect(); // animate out of the way

                        deltaY = targetBox.height;

                        if (show) {
                          // if not here we need to handle that as an error
                          childs.forEach(function (el) {
                            animation = el.animate([{
                              transformOrigin: "top left",
                              transform: "translate(0px, ".concat(deltaY, "px)")
                            }], options);
                          });
                          animation.addEventListener("finish", function () {
                            target.animate([{
                              opacity: 1
                            }], options);
                          });
                        } else {
                          // target has been removed from dom so move childs back to place
                          animation = target.animate([{
                            opacity: 0
                          }], options); //animation.addEventListener("finish", () => {

                          childs.forEach(function (el) {
                            childanimation = el.animate([{
                              transformOrigin: "top left",
                              transform: "none"
                            }], options);
                          });
                          childanimation.addEventListener("finish", function () {
                            _this.refresh();
                          }); //})
                        }

                        ;

                      case 22:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function handleEditBoxActive(_x2) {
                return _ref2.apply(this, arguments);
              };
            }();
            /**
             * Gather box includes for display, watch for dates
             *
             * @function getData
             */


            getData = /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var awaitRender;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return (0, _fetch.Fetch)("".concat(baseUrl, "current-boxes-by-product/").concat(idMap[productJson.id])).then(function (_ref4) {
                          var error = _ref4.error,
                              json = _ref4.json;

                          if (error) {
                            fetchError = error;
                          } else {
                            if (Object.keys(json).length > 0) {
                              fetchDates = Object.keys(json);
                              fetchJson = json;
                              console.log(fetchDates);
                            }
                          } // ok, I've got the dates and all data needed to start presenting
                          // However we may already have a selected date from location.search query string or from cartdata
                          // components which I then want to animate into view by o
                          // 1. await refresh
                          // 2. animated child siblings down
                          // 3. animated fade to o-1 of the rendered element
                          // This will be the common pattern - use a wrapper??
                          // in both the following circumstances we should present entire edit box


                          if (cartJson.items) {
                            // find the selected date from the items
                            var _iterator2 = _createForOfIteratorHelper(cartJson.items),
                                _step2;

                            try {
                              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                                item = _step2.value;
                                console.warn(item);

                                if (item.product.id === productJson.id) {
                                  // ??
                                  selectedDate = item.properties["Delivery Date"];
                                  editBoxActive = true; //fetchBox({ box: box, cart: cartJson }); // ???

                                  break;
                                }
                              }
                            } catch (err) {
                              _iterator2.e(err);
                            } finally {
                              _iterator2.f();
                            }
                          }

                          if (window.location.search) {
                            // use the selected date
                            var d = new Date(parseInt(window.location.search.slice(1), 10));
                            selectedDate = d.toDateString();
                            editBoxActive = true; //fetchBox({ box: null, cart: null });
                          }

                          loading = false;
                          editBoxActive = true;

                          _this.refresh();
                        });

                      case 2:
                        if (editBoxActive) {
                          awaitRender = function awaitRender() {
                            console.log('checking');

                            if (!document.getElementById("myText")) {
                              setTimeout(awaitRender, 100);
                            } else {
                              // wait another fraction to avoid flicker
                              setTimeout(function () {
                                return handleEditBoxActive(editBoxActive);
                              }, 200);
                            }
                          };

                          awaitRender();
                        }

                      case 3:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function getData() {
                return _ref3.apply(this, arguments);
              };
            }();

            _context4.next = 14;
            return _awaitAsyncGenerator(getData());

          case 14:
            /**
             * Handle click event on selected elements
             *
             * @function handleClick
             * @param {object} ev The firing event
             * @listens click
             */
            handleClick = /*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(ev) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        console.log(ev.target.tagName);

                        if (ev.target.tagName === "INPUT" || ev.target.tagName === "DIV") {
                          if (ev.target.type === "checkbox" && ev.target.id === "toggleEditBox" || ev.target.id === "toggleInput") {
                            editBoxActive = !editBoxActive;
                            handleEditBoxActive(editBoxActive);
                          }
                        }

                      case 2:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function handleClick(_x3) {
                return _ref5.apply(this, arguments);
              };
            }();

            this.addEventListener("click", handleClick);
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context4.prev = 18;
            _iterator = _asyncIterator(this);

          case 20:
            _context4.next = 22;
            return _awaitAsyncGenerator(_iterator.next());

          case 22:
            _step = _context4.sent;
            _iteratorNormalCompletion = _step.done;
            _context4.next = 26;
            return _awaitAsyncGenerator(_step.value);

          case 26:
            _value = _context4.sent;

            if (_iteratorNormalCompletion) {
              _context4.next = 35;
              break;
            }

            _value2 = _value;
            productJson = _value2.productJson;
            _context4.next = 32;
            return (0, _cjs.createElement)("div", {
              "class": "mt2 sans-serif",
              id: "container-box"
            }, loading ? (0, _cjs.createElement)(_barLoader["default"], null) : (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)("input", {
              "class": "b--silver mr2",
              type: "checkbox",
              id: "toggleEditBox",
              checked: editBoxActive
            }), (0, _cjs.createElement)("label", {
              "for": "toggleEditBox",
              htmlFor: "toggleEditBox"
            }, "Customize your box"), editBoxActive && (0, _cjs.createElement)(TextParagraph, null)));

          case 32:
            _iteratorNormalCompletion = true;
            _context4.next = 20;
            break;

          case 35:
            _context4.next = 41;
            break;

          case 37:
            _context4.prev = 37;
            _context4.t0 = _context4["catch"](18);
            _didIteratorError = true;
            _iteratorError = _context4.t0;

          case 41:
            _context4.prev = 41;
            _context4.prev = 42;

            if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
              _context4.next = 46;
              break;
            }

            _context4.next = 46;
            return _awaitAsyncGenerator(_iterator["return"]());

          case 46:
            _context4.prev = 46;

            if (!_didIteratorError) {
              _context4.next = 49;
              break;
            }

            throw _iteratorError;

          case 49:
            return _context4.finish(46);

          case 50:
            return _context4.finish(41);

          case 51:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[18, 37, 41, 51], [42,, 46, 50]]);
  }));
  return _ContainerBoxApp.apply(this, arguments);
}

var _default = ContainerBoxApp;
exports["default"] = _default;
});

require.register("components/container-box.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("regenerator-runtime/runtime");

var _cjs = require("@bikeshaving/crank/cjs");

var _dom = require("@bikeshaving/crank/cjs/dom");

var _error = _interopRequireDefault(require("./error"));

var _barLoader = _interopRequireDefault(require("./bar-loader"));

var _selectMenu = _interopRequireDefault(require("./select-menu"));

var _flash = _interopRequireDefault(require("./flash"));

var _animationWrapper = _interopRequireDefault(require("./animation-wrapper"));

var _fetch = require("./fetch");

var _lib = require("../lib");

var _events = require("./events");

var _price = _interopRequireDefault(require("./price"));

var _dateSelector = _interopRequireDefault(require("./container/date-selector"));

var _boxProducts = _interopRequireDefault(require("./container/box-products"));

var _quantityForm = _interopRequireDefault(require("./container/quantity-form"));

var _productSelector = _interopRequireDefault(require("./container/product-selector"));

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _awaitAsyncGenerator(value) { return new _AwaitValue(value); }

function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }

function _AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; var wrappedAwait = value instanceof _AwaitValue; Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) { if (wrappedAwait) { resume(key === "return" ? "return" : "next", arg); return; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen["return"] !== "function") { this["return"] = undefined; } }

if (typeof Symbol === "function" && Symbol.asyncIterator) { _AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; }

_AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };

_AsyncGenerator.prototype["throw"] = function (arg) { return this._invoke("throw", arg); };

_AsyncGenerator.prototype["return"] = function (arg) { return this._invoke("return", arg); };

function _AwaitValue(value) { this.wrapped = value; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * ContainerBoxApp crank component
 *
 * @generator ContainerBoxApp
 * @param {object} props The property object
 * @param {object} props.productJson Shopify product data as extracted from
 * product page json script tag
 * @yields {Element} A crank DOM component
 */

function ContainerBoxApp(_x) {
  return _ContainerBoxApp.apply(this, arguments);
}
/*
          <TextParagraph
            isActive={editBoxActive}
            componentId="myText"
          />
          */


function _ContainerBoxApp() {
  _ContainerBoxApp = _wrapAsyncGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(_ref) {
    var _this = this;

    var productJson, fetchError, loading, baseUrl, fetchJson, fetchDates, selectedDate, selectedBox, selectedIncludes, possibleAddons, selectedExcludes, selectedAddons, totalPrice, showBoxActive, editBoxActive, modalQtyForm, loadedFromCart, cartBoxId, cartAddons, cartRemovedItems, cartJson, loadBox, submitCart, handleClick, handleDateSelect, listMap, updatePriceElement, moveProduct, quantityUpdate, init, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, _value2;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            productJson = _ref.productJson;

            /**
             * If fetching data was unsuccessful.
             *
             * @member fetchError
             * @type {object|string|null}
             */
            fetchError = null;
            /**
             * Display loading indicator while fetching data
             *
             * @member loading
             * @type {boolean}
             */

            loading = true;
            /**
             * Base url to api
             *
             * @member baseUrl
             * @type {string}
             */

            baseUrl = "https://streamsidedev.cousinsd.net/api/";
            /**
             * Contains box data as collected from [api/current-boxes-by-product]{@link
             * module:api/current-boxes-by-product}. The data uses delivery date as keys to unsorted
             * array of box data.
             *
             * @member fetchJson
             * @type {object}
             */

            fetchJson = {};
            /**
             * Upcoming delivery dates, same as Object.keys(fetchJson)
             *
             * @member fetchDates
             * @type {object}
             */

            fetchDates = [];
            /**
             * The selected date after user select, one of fetchJson.keys
             *
             * @member selectedDate
             * @type {string}
             */

            /**
             * Items included in the box, initially matches selectedBox.includedProducts unless pulling from cart data
             * but can be edited by the user
             *
             * @member selectedIncludes
             * @type {Array}
             */
            selectedIncludes = [];
            /**
             * Items that can be included in the box, initially matches selectedBox.addOnProducts unless pulling from cart data
             *
             * @member possibleAddons
             * @type {Array}
             */

            possibleAddons = [];
            /**
             * Items excluded from the box by the user - can only be items initially in selectedBox.includedProducts
             *
             * @member selectedExcludes
             * @type {Array}
             */

            selectedExcludes = [];
            /**
             * Items added to the box by the user, can only be items found in selectedBox.addOnProducts
             *
             * @member selectedAddons
             * @type {Array}
             */

            selectedAddons = [];
            /**
             * The total price TODO here in development udating on refresh - production
             * may actuall use priceElement as above
             *
             * @member priceElement
             * @type {Element}
             */

            totalPrice = productJson.variants[0].price;
            /**
             * Show box flag - using this to animate in after loading
             *
             * @member showBoxActive
             * @type {boolean}
             */

            showBoxActive = false;
            /**
             * Show box customize options - used to animate in the options
             *
             * @member editBoxActive
             * @type {boolean}
             */

            editBoxActive = false;
            /**
             * Display edit quantities form modal
             *
             * @member modalQtyForm
             * @type {boolean}
             */

            modalQtyForm = false;
            /**
             * Have we loaded data from an existing cart?
             *
             * @member loadedFromCart
             * @type {boolean} false
             */

            loadedFromCart = false;
            /**
             * Hold on to the product id of the box in the cart, useful to easily check
             * if this box is the same as in the cart, particulary as we only allow one
             * box per order
             *
             * @member cartBoxId
             * @type {number} false
             */

            cartBoxId = null;
            /**
             * Extra items in the current cart, stored as object of id: quantity
             *
             * @member cartAddons
             * @type {object}
             */

            cartAddons = {};
            /**
             * Removed items recorded in the current cart
             *
             * @member cartRemovedItems
             * @type {Array}
             */

            cartRemovedItems = [];
            /**
             * Contains cart data collected from html template json data
             * This will then also contain a selected date
             *
             * @member cartJson
             * @type {object}
             */

            _context5.next = 20;
            return _awaitAsyncGenerator(JSON.parse(document.querySelector("#cart-json").textContent));

          case 20:
            cartJson = _context5.sent;

            /**
             * Load the product items after selectedBox is made
             *
             * @function loadBox
             */
            loadBox = function loadBox() {
              // may have upped the quantity of standard included product
              var checkLoadPresence = function checkLoadPresence(product) {
                var found = selectedIncludes.find(function (el) {
                  return el.shopify_variant_id === product.shopify_variant_id;
                });
                if (typeof found === "undefined") return false;
                return found;
              };

              selectedIncludes = selectedBox.includedProducts.map(function (el) {
                var item = _objectSpread({}, el);

                var found = checkLoadPresence(el);
                item.quantity = found ? found.quantity : 1;
                return item;
              });
              possibleAddons = selectedBox.addOnProducts.map(function (el) {
                var item = _objectSpread({}, el);

                item.quantity = 1;
                return item;
              }).filter(function (el) {
                return !selectedIncludes.find(function (ob) {
                  return ob.shopify_title === el.shopify_title;
                });
              }); // TODO find another smarter, cleaner way to do this. The purpose of this
              // algorithm is to match addons and excludes when switching between dates
              // and so is not done initially when loading cart data.
              // SEE container-box.bak.js
              // NOTE me thinks that I need to run a different routing depending on having a cart.
              // handle cart inclusions - cartRemovedItems and cartAddons are collected in "init"

              var cartAddonIds = Object.keys(cartAddons); // find current addon selection that are possible for this box and use has already selected addons

              var currentSelectedAddons = selectedAddons.filter(function (el) {
                return possibleAddons.map(function (el) {
                  return el.shopify_product_id;
                }).includes(el.shopify_product_id);
              });
              console.log('current addons', currentSelectedAddons);
              console.log(possibleAddons.map(function (el) {
                return el.shopify_title;
              })); // problem now is that I assume a cart

              if (cartAddonIds.length) {
                console.log('cart add ids', cartAddonIds);
                selectedAddons = possibleAddons.filter(function (el) {
                  return cartAddonIds.includes(el.shopify_variant_id);
                }).map(function (el) {
                  var item = _objectSpread({}, el);

                  if (cartAddonIds.includes(el.shopify_variant_id)) item.quantity = cartAddons[el.shopify_variant_id];
                  return item;
                });
              } else {
                // but even I may have changed the selectedAddons???
                console.log('no cart add ids', cartAddonIds);
                selectedAddons = selectedAddons.filter(function (el) {
                  return possibleAddons.map(function (el) {
                    return el.shopify_product_id;
                  }).includes(el.shopify_product_id);
                });
              }

              possibleAddons = possibleAddons.filter(function (el) {
                return !cartAddonIds.includes(el.shopify_variant_id);
              });
              selectedExcludes = selectedIncludes.filter(function (el) {
                return cartRemovedItems.includes(el.shopify_title);
              });
              selectedIncludes = selectedIncludes.map(function (el) {
                var item = _objectSpread({}, el);

                if (el.shopify_title === "Carrot bunch") {}

                if (cartAddonIds.includes(el.shopify_variant_id)) {
                  item.quantity += cartAddons[el.shopify_variant_id];
                }

                return item;
              }).filter(function (el) {
                return !cartRemovedItems.includes(el.shopify_title);
              }); // and what happens when the date is changed?
              //totalPrice = selectedBox.shopify_price;

              updatePriceElement(); //console.log("box loaded");
            };
            /**
             * Make up cart data, submit to cart.js and redirect page
             *
             * @function submitCart
             */


            submitCart = /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var makeTitle, data, headers, _yield$PostFetch, clearError, clearJson, _yield$PostFetch2, error, json, url;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        makeTitle = function makeTitle(el) {
                          var title = el.shopify_title;

                          if (el.quantity > 1) {
                            title = "".concat(title, " (").concat(el.quantity, ")");
                          }

                          return title;
                        };

                        data = {};
                        data.items = []; // following that are any addon items

                        selectedAddons.forEach(function (el) {
                          var id = el.shopify_variant_id;

                          if (id) {
                            data.items.push({
                              quantity: el.quantity,
                              id: el.shopify_variant_id,
                              properties: {
                                "Delivery Date": selectedDate,
                                "Add on product to": selectedBox.shopify_title
                              }
                            });
                          }
                        }); // following that are any addon items that are already included in box but are extras

                        selectedIncludes.forEach(function (el) {
                          if (el.quantity > 1) {
                            data.items.push({
                              quantity: el.quantity - 1,
                              id: el.shopify_variant_id,
                              properties: {
                                "Delivery Date": selectedDate,
                                "Add on product to": selectedBox.shopify_title
                              }
                            });
                          }
                        }); // first item is the box itself

                        data.items.push({
                          quantity: 1,
                          id: selectedBox.shopify_variant_id,
                          properties: {
                            "Delivery Date": selectedDate,
                            "Including": selectedIncludes.map(function (el) {
                              return makeTitle(el);
                            }).join(),
                            "Removed Items": selectedExcludes.map(function (el) {
                              return el.shopify_title;
                            }).join(),
                            "Add on Items": selectedAddons.map(function (el) {
                              return makeTitle(el);
                            }).join()
                          }
                        });
                        headers = {
                          "Content-Type": "application/json"
                        };
                        _context.next = 9;
                        return (0, _fetch.PostFetch)({
                          src: "/cart/clear.js",
                          data: data,
                          headers: headers
                        });

                      case 9:
                        _yield$PostFetch = _context.sent;
                        clearError = _yield$PostFetch.error;
                        clearJson = _yield$PostFetch.json;

                        if (!clearError) {
                          _context.next = 15;
                          break;
                        }

                        console.warn(clearError); // what to do here??

                        return _context.abrupt("return");

                      case 15:
                        _context.next = 17;
                        return (0, _fetch.PostFetch)({
                          src: "/cart/add.js",
                          data: data,
                          headers: headers
                        });

                      case 17:
                        _yield$PostFetch2 = _context.sent;
                        error = _yield$PostFetch2.error;
                        json = _yield$PostFetch2.json;
                        url = "/cart";

                        if (typeof window.swup === 'undefined') {
                          window.location = url;
                        } else {
                          window.swup.loadPage({
                            url: url
                          });
                        }

                      case 22:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function submitCart() {
                return _ref2.apply(this, arguments);
              };
            }();
            /**
             * Handle click event on selected elements
             *
             * @function handleClick
             * @param {object} ev The firing event
             * @listens click
             */


            handleClick = /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(ev) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        if (ev.target.tagName === "INPUT" || ev.target.tagName === "DIV") {
                          if (ev.target.type === "checkbox" && ev.target.id === "toggleEditBox" || ev.target.id === "toggleInput") {
                            editBoxActive = !editBoxActive;

                            _this.refresh();
                          }
                        }

                        if (ev.target.tagName === "BUTTON") {
                          if (ev.target.id === "qtyForm") {
                            modalQtyForm = !modalQtyForm;

                            _this.refresh();
                          }

                          if (ev.target.id === "qtyFormClose") {
                            modalQtyForm = !modalQtyForm;

                            _this.refresh();
                          }
                        }

                      case 2:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function handleClick(_x2) {
                return _ref3.apply(this, arguments);
              };
            }();

            this.addEventListener("click", handleClick);
            /**
             * Select the date for box
             *
             * @function handleDateSelect
             * @param ev {object} The event object with ev.detail.date to be selected
             * @listens selectDateEvent
             */

            handleDateSelect = function handleDateSelect(ev) {
              selectedDate = ev.detail.date;
              selectedBox = fetchJson[selectedDate];
              loadBox();
              showBoxActive = true;

              _this.refresh();
            };

            this.addEventListener("selectDateEvent", handleDateSelect);
            /** 
             * Map strings to the lists
             *
             * @function listMap
             */

            listMap = function listMap(str) {
              var list;

              switch (str) {
                case 'possibleAddons':
                  list = possibleAddons;
                  break;

                case 'selectedAddons':
                  list = selectedAddons;
                  break;

                case 'selectedIncludes':
                  list = selectedIncludes;
                  break;

                case 'selectedExcludes':
                  list = selectedExcludes;
                  break;
              }

              return list;
            };
            /**
             * Update priceElement on relevant changes
             *
             * @function updatePriceElement
             */


            updatePriceElement = function updatePriceElement() {
              var start = selectedBox.shopify_price;
              selectedIncludes.forEach(function (el) {
                if (el.quantity > 1) start += el.shopify_price * (el.quantity - 1);
              });
              selectedAddons.forEach(function (el) {
                start += el.shopify_price * el.quantity;
              });
              totalPrice = start; // ensure that this.refresh is called

              document.querySelector("#product-price").innerHTML = "$".concat((totalPrice * 0.01).toFixed(2));
            };
            /**
             * Move product between product lists of addon, excludes etc
             * * ev.detail.id - product id
             * * ev.detail.from - moving from this list
             * * ev.detail.to - move to this list
             *
             * @function moveItem
             * @param ev {object} The event object with ev.detail
             * @listens moveProductEvent
             */


            moveProduct = function moveProduct(ev) {
              var fromList = listMap(ev.detail.from);
              var toList = listMap(ev.detail.to);
              var id = ev.detail.id;
              var i;

              for (i = 0; i < fromList.length; i++) {
                if (fromList[i].shopify_product_id === parseInt(id, 10)) {
                  toList.push(fromList[i]);
                  fromList.splice(i, 1);
                }
              }

              toList = (0, _helpers.sortObjectByKey)(toList, 'shopify_title');
              updatePriceElement();

              _this.refresh();
            };

            this.addEventListener("moveProductEvent", moveProduct);
            /**
             * Quantity changed by quantity form
             * * ev.detail.id - product id
             * * ev.detail.quantity - the value changed
             * * ev.detail.list - the list: either selectedIncludes or selectedAddons
             *
             * @function quantityUpdated
             * @param ev {object} The event object with ev.detail
             * @listens quantityUpdateEvent
             */

            quantityUpdate = function quantityUpdate(ev) {
              var productList = listMap(ev.detail.list);
              var targetList;
              if (ev.detail.list === "selectedIncludes") targetList = "selectedExcludes";
              if (ev.detail.list === "selectedAddons") targetList = "possibleAddons";
              productList.forEach(function (el) {
                if (el.shopify_product_id === parseInt(ev.detail.id, 10)) {
                  if (parseInt(ev.detail.quantity) === 0) {
                    el.quantity = 1;
                    moveProduct({
                      detail: {
                        id: el.shopify_product_id,
                        from: ev.detail.list,
                        to: targetList
                      }
                    });
                  } else {
                    el.quantity = ev.detail.quantity;
                  }
                }
              });
              updatePriceElement();

              _this.refresh();
            };

            this.addEventListener("quantityUpdateEvent", quantityUpdate);
            /**
             * Gather box includes for display, watch for dates, cart items and date
             * already selected from collection
             *
             * @function init
             */

            init = /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return (0, _fetch.Fetch)("".concat(baseUrl, "current-boxes-by-product/").concat(productJson.id)).then( /*#__PURE__*/function () {
                          var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref5) {
                            var error, json, showBox, _iterator2, _step2, item, d;

                            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                              while (1) {
                                switch (_context3.prev = _context3.next) {
                                  case 0:
                                    error = _ref5.error, json = _ref5.json;

                                    if (error) {
                                      fetchError = error;
                                    } else {
                                      if (Object.keys(json).length > 0) {
                                        fetchDates = Object.keys(json);
                                        fetchJson = json;

                                        if (fetchDates.length === 1) {
                                          selectedDate = fetchDates[0];
                                          selectedBox = fetchJson[selectedDate];
                                          showBox = true;
                                        }
                                      }
                                    }

                                    // in both the following circumstances we should present entire edit box
                                    if (cartJson.items) {
                                      // find the selected date from the items
                                      _iterator2 = _createForOfIteratorHelper(cartJson.items);

                                      try {
                                        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                                          item = _step2.value;

                                          if (item.product_type === "Container Box") {
                                            // get the delivery date regardless of which box
                                            selectedDate = item.properties["Delivery Date"]; // using date if available

                                            if (hasOwnProp.call(fetchJson, selectedDate)) selectedBox = fetchJson[selectedDate];
                                            showBox = true; // can assume same removed items for a different box

                                            if (hasOwnProp.call(item.properties, "Removed Items")) {
                                              cartRemovedItems = item.properties["Removed Items"].split(",");
                                            }

                                            cartBoxId = item.product_id;

                                            if (item.product_id === productJson.id) {
                                              // only now are we sure that this is the same box
                                              loadedFromCart = true; //fetchBox({ box: box, cart: cartJson }); // ???
                                            }
                                          }

                                          if (item.product_type === "Box Produce") {
                                            // these are included in the box as addons
                                            cartAddons[item.variant_id] = item.quantity;
                                          }
                                        }
                                      } catch (err) {
                                        _iterator2.e(err);
                                      } finally {
                                        _iterator2.f();
                                      }
                                    }

                                    if (window.location.search) {
                                      // use the selected date
                                      d = new Date(parseInt(window.location.search.slice(1), 10));
                                      selectedDate = d.toDateString();
                                      selectedBox = fetchJson[selectedDate];
                                      showBox = true; //fetchBox({ box: null, cart: null });
                                    } // either a single delivery date, or selectd date, or box in cart


                                    if (showBox) {
                                      loadBox();

                                      _this.schedule(function () {
                                        setTimeout(function () {
                                          // helps to keep things smooth on load
                                          showBoxActive = true;

                                          _this.refresh();
                                        }, 300);
                                      });
                                    }

                                    loading = false; //moveProduct({detail: {id:"5571290923174", from:"selectedIncludes", to:"selectedExcludes"}});

                                    _this.refresh();

                                  case 7:
                                  case "end":
                                    return _context3.stop();
                                }
                              }
                            }, _callee3);
                          }));

                          return function (_x3) {
                            return _ref6.apply(this, arguments);
                          };
                        }());

                      case 2:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function init() {
                return _ref4.apply(this, arguments);
              };
            }();

            _context5.next = 36;
            return _awaitAsyncGenerator(init());

          case 36:
            // set up script
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context5.prev = 38;
            _iterator = _asyncIterator(this);

          case 40:
            _context5.next = 42;
            return _awaitAsyncGenerator(_iterator.next());

          case 42:
            _step = _context5.sent;
            _iteratorNormalCompletion = _step.done;
            _context5.next = 46;
            return _awaitAsyncGenerator(_step.value);

          case 46:
            _value = _context5.sent;

            if (_iteratorNormalCompletion) {
              _context5.next = 55;
              break;
            }

            _value2 = _value;
            productJson = _value2.productJson;
            _context5.next = 52;
            return (0, _cjs.createElement)("div", {
              "class": "mt2 sans-serif",
              id: "container-box"
            }, loading ? (0, _cjs.createElement)(_barLoader["default"], null) : (0, _cjs.createElement)(_cjs.Fragment, null, modalQtyForm && (0, _cjs.createElement)(_quantityForm["default"], {
              selectedIncludes: selectedIncludes,
              selectedAddons: selectedAddons,
              totalPrice: totalPrice
            }), (0, _cjs.createElement)(_dateSelector["default"], {
              fetchDates: fetchDates,
              selectedDate: selectedDate
            }), (0, _cjs.createElement)(_boxProducts["default"], {
              selectedIncludes: selectedIncludes,
              selectedExcludes: selectedExcludes,
              selectedAddons: selectedAddons,
              isActive: showBoxActive,
              componentId: "defaultBox"
            }), showBoxActive && (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)("div", {
              id: "toggleInput",
              "class": "pointer z-max w-100 pv3 gray dt"
            }, (0, _cjs.createElement)("div", {
              "class": "dtc"
            }, (0, _cjs.createElement)("input", {
              "class": "b--silver mr2",
              type: "checkbox",
              id: "toggleEditBox",
              checked: editBoxActive
            }), (0, _cjs.createElement)("label", {
              "for": "toggleEditBox",
              htmlFor: "toggleEditBox",
              "class": "pointer"
            }, "Customize your box")), (0, _cjs.createElement)("div", {
              "class": "dtc"
            }, (0, _cjs.createElement)("div", {
              "class": "tr"
            }, (0, _cjs.createElement)("button", {
              "class": "f6 outline-0 gray b--gray ba ba1 bg-transparent br2 pa1 mb1 pointer",
              title: "Change product quantities",
              id: "qtyForm",
              type: "button"
            }, "Change quantities")))), (0, _cjs.createElement)(_productSelector["default"], {
              selectedIncludes: selectedIncludes,
              possibleAddons: possibleAddons,
              isActive: editBoxActive,
              componentId: "productSelector"
            }), selectedDate && (0, _cjs.createElement)(_cjs.Fragment, null, cartBoxId && selectedBox.shopify_product_id !== cartBoxId && (0, _cjs.createElement)("div", {
              "class": "warn fg-warn br2 w-100 ba mb2 tc"
            }, (0, _cjs.createElement)("span", {
              "class": "f3 b pr1"
            }, "!"), "Adding this box to your cart will remove the box currently in your cart."), (0, _cjs.createElement)("button", {
              type: "submit",
              name: "add",
              id: "add-button",
              "aria-label": "Add to cart",
              "class": "f6 ttu w-100 tracked dim outline-0 debut-yellow b--debut-brown ba ba1 bg-debut-brown br2 pa2 mb1 pointer",
              "data-add-to-cart": "",
              onclick: submitCart
            }, (0, _cjs.createElement)("span", {
              "data-add-to-cart-text": ""
            }, loadedFromCart ? "Update selection" : "Add to cart"), " ", (0, _cjs.createElement)("span", {
              "class": "dn",
              "data-loader": ""
            }, (0, _cjs.createElement)("svg", {
              "aria-hidden": "true",
              focusable: "false",
              role: "presentation",
              "class": "icon icon-spinner",
              viewbox: "0 0 20 20"
            }, (0, _cjs.createElement)("path", {
              d: "M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z",
              fill: "#919EAB"
            }))))))));

          case 52:
            _iteratorNormalCompletion = true;
            _context5.next = 40;
            break;

          case 55:
            _context5.next = 61;
            break;

          case 57:
            _context5.prev = 57;
            _context5.t0 = _context5["catch"](38);
            _didIteratorError = true;
            _iteratorError = _context5.t0;

          case 61:
            _context5.prev = 61;
            _context5.prev = 62;

            if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
              _context5.next = 66;
              break;
            }

            _context5.next = 66;
            return _awaitAsyncGenerator(_iterator["return"]());

          case 66:
            _context5.prev = 66;

            if (!_didIteratorError) {
              _context5.next = 69;
              break;
            }

            throw _iteratorError;

          case 69:
            return _context5.finish(66);

          case 70:
            return _context5.finish(61);

          case 71:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[38, 57, 61, 71], [62,, 66, 70]]);
  }));
  return _ContainerBoxApp.apply(this, arguments);
}

var _default = ContainerBoxApp;
exports["default"] = _default;
});

require.register("components/container/box-products.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

var _animationWrapper = _interopRequireDefault(require("../animation-wrapper"));

var _price = _interopRequireDefault(require("../price"));

var _events = require("../events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _marked = /*#__PURE__*/regeneratorRuntime.mark(BoxProducts);

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Box products display, shows included as well as excluded items and addons
 *
 * @yields {Element} DOM component
 */
function BoxProducts(_ref) {
  var _this = this;

  var selectedIncludes, selectedAddons, selectedExcludes, handleMouseUp, _iterator, _step, _step$value;

  return regeneratorRuntime.wrap(function BoxProducts$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          selectedIncludes = _ref.selectedIncludes, selectedAddons = _ref.selectedAddons, selectedExcludes = _ref.selectedExcludes;

          /**
           * Handle mouse up on selected components
           *
           * @function handleMouseUp
           * @param {object} ev The firing event
           * @listens click
           */
          handleMouseUp = function handleMouseUp(ev) {
            var id;

            if (ev.target.tagName === "DIV") {
              switch (ev.target.getAttribute("name")) {
                case "selectedAddons":
                  id = ev.target.getAttribute("data-item");

                  _this.dispatchEvent((0, _events.moveProductEvent)(id, "selectedAddons", "possibleAddons"));

                  break;

                case "selectedExcludes":
                  id = ev.target.getAttribute("data-item");

                  _this.dispatchEvent((0, _events.moveProductEvent)(id, "selectedExcludes", "selectedIncludes"));

                  break;
              }
            }
          };

          this.addEventListener("mouseup", handleMouseUp); //for (const {selectedIncludes: newIncludes, selectedAddons: newAddons, selectedExcludes: newExcludes} of this) {

          _iterator = _createForOfIteratorHelper(this);
          _context.prev = 4;

          _iterator.s();

        case 6:
          if ((_step = _iterator.n()).done) {
            _context.next = 15;
            break;
          }

          _step$value = _step.value;
          selectedIncludes = _step$value.selectedIncludes;
          selectedAddons = _step$value.selectedAddons;
          selectedExcludes = _step$value.selectedExcludes;
          _context.next = 13;
          return (0, _cjs.createElement)("div", {
            id: "defaultBox",
            "class": "absolute o-0"
          }, (0, _cjs.createElement)("div", {
            "class": "ttu b pt2"
          }, "Box Products"), (0, _cjs.createElement)("div", {
            "class": "w-100 bb b--silver pv2 mb2 fl cf"
          }, !selectedIncludes.length ? (0, _cjs.createElement)("div", null, "Build your own box with available products.") : selectedIncludes.map(function (el) {
            return (0, _cjs.createElement)("div", {
              "class": "fl f6 ph3 ma1 ba br-pill b--streamside-blue bg-streamside-blue white"
            }, el.shopify_title, " ", el.quantity > 1 ? "(".concat(el.quantity, ") ").concat((0, _price["default"])(el, true)) : "");
          }), selectedAddons.map(function (el) {
            return (0, _cjs.createElement)("div", {
              "class": "fl f6 ph3 ma1 ba br-pill b--streamside-maroon bg-streamside-maroon white pointer",
              name: "selectedAddons",
              "data-item": el.shopify_product_id,
              "data-title": el.shopify_title,
              title: "Remove from your box"
            }, el.shopify_title, " (", el.quantity, ") ", (0, _price["default"])(el), " \u2718");
          })), (0, _cjs.createElement)("div", {
            "class": "cf"
          }), selectedExcludes.length ? (0, _cjs.createElement)("div", {
            "class": "cf"
          }, (0, _cjs.createElement)("div", {
            "class": "ttu b"
          }, "Excluded Products"), (0, _cjs.createElement)("div", {
            "class": "fw1 f6 gray"
          }, "A suprise item will be substitued"), (0, _cjs.createElement)("div", {
            "class": "w-100 bb b--silver pv2 fl"
          }, selectedExcludes.map(function (el) {
            return (0, _cjs.createElement)("div", {
              "class": "fl f6 ph3 ma1 ba br-pill b--streamside-orange bg-streamside-orange white pointer",
              name: "selectedExcludes",
              "data-item": el.shopify_product_id,
              "data-title": el.shopify_title,
              title: "Remove from your box"
            }, el.shopify_title, " \u2718");
          }))) : "");

        case 13:
          _context.next = 6;
          break;

        case 15:
          _context.next = 20;
          break;

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](4);

          _iterator.e(_context.t0);

        case 20:
          _context.prev = 20;

          _iterator.f();

          return _context.finish(20);

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, _marked, this, [[4, 17, 20, 23]]);
}

;

var _default = (0, _animationWrapper["default"])(BoxProducts);

exports["default"] = _default;
});

require.register("components/container/date-selector.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

var _events = require("../events");

var _selectMenu = _interopRequireDefault(require("../select-menu"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _marked = /*#__PURE__*/regeneratorRuntime.mark(DateSelector);

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Date selector component
 *
 * @yields {Element} DOM component
 */
function DateSelector(_ref) {
  var _this = this;

  var fetchDates, selectedDate, selectDateOpen, selectorId, handleMouseUp, handleSelectorOpen, _iterator, _step, _step$value;

  return regeneratorRuntime.wrap(function DateSelector$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          fetchDates = _ref.fetchDates, selectedDate = _ref.selectedDate;

          /**
           * Display date selection menu if active
           *
           * @member selectDateOpen
           * @type {boolean}
           */
          selectDateOpen = false;
          /**
           * Selector id for select menu
           *
           * @member selectorId
           * @type {string}
           */

          selectorId = "selectDate";
          /**
           * Handle mouse up on selected components
           *
           * @function handleMouseUp
           * @param {object} ev The firing event
           * @listens click
           */

          handleMouseUp = function handleMouseUp(ev) {
            if (ev.target.tagName === "BUTTON") {
              switch (ev.target.id) {
                case selectorId:
                  _this.dispatchEvent((0, _events.selectorOpenEvent)(selectorId));

                  break;
              }
            } else if (ev.target.tagName === "DIV") {
              switch (ev.target.getAttribute("name")) {
                case selectorId:
                  var date = ev.target.getAttribute("data-item");

                  _this.dispatchEvent((0, _events.selectorOpenEvent)(null));

                  _this.dispatchEvent((0, _events.selectDateEvent)(date));

                  break;
              }
            }
          };

          this.addEventListener("mouseup", handleMouseUp);
          /**
           * Handle selector open event, if matching selectorId the menu is open, else close
           *
           * @function handleSelectorOpen
           * @param {object} ev The firing event
           * @listens selectorOpenEvent
           */

          handleSelectorOpen = function handleSelectorOpen(ev) {
            if (selectorId === ev.detail.selector) {
              selectDateOpen = !selectDateOpen;
            } else {
              selectDateOpen = false;
            }

            _this.refresh();
          };

          this.addEventListener("selectorOpenEvent", handleSelectorOpen);
          _iterator = _createForOfIteratorHelper(this);
          _context.prev = 8;

          _iterator.s();

        case 10:
          if ((_step = _iterator.n()).done) {
            _context.next = 18;
            break;
          }

          _step$value = _step.value;
          fetchDates = _step$value.fetchDates;
          selectedDate = _step$value.selectedDate;
          _context.next = 16;
          return (0, _cjs.createElement)("div", {
            id: "dateSelector"
          }, fetchDates.length > 0 ? (0, _cjs.createElement)(_cjs.Fragment, null, !selectedDate && (0, _cjs.createElement)("div", {
            "class": "warn fg-warn br2 w-100 ba mb2 tc"
          }, (0, _cjs.createElement)("span", {
            "class": "f3 b pr1"
          }, "!"), "Please choose a date for delivery"), (0, _cjs.createElement)("div", {
            "class": "relative"
          }, (0, _cjs.createElement)(_selectMenu["default"], {
            id: selectorId,
            menu: fetchDates.map(function (el) {
              return {
                text: el,
                item: el
              };
            }),
            title: "Select Date",
            active: selectDateOpen
          }, selectedDate ? selectedDate : "Select delivery date", "\xA0\xA0\xA0\u25BE"))) : (0, _cjs.createElement)("div", {
            "class": "warn fg-warn br2 w-100 ba pa1 mb2 tc"
          }, (0, _cjs.createElement)("span", {
            "class": "f3 b pr1"
          }, "!"), "No boxes scheduled for delivery, please come back later."));

        case 16:
          _context.next = 10;
          break;

        case 18:
          _context.next = 23;
          break;

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](8);

          _iterator.e(_context.t0);

        case 23:
          _context.prev = 23;

          _iterator.f();

          return _context.finish(23);

        case 26:
        case "end":
          return _context.stop();
      }
    }
  }, _marked, this, [[8, 20, 23, 26]]);
}

;
var _default = DateSelector;
exports["default"] = _default;
});

require.register("components/container/product-selector.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

var _animationWrapper = _interopRequireDefault(require("../animation-wrapper"));

var _price = _interopRequireDefault(require("../price"));

var _events = require("../events");

var _selectMenu = _interopRequireDefault(require("../select-menu"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _marked = /*#__PURE__*/regeneratorRuntime.mark(ProductSelector);

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Box products display, shows included as well as excluded items and addons
 *
 * @yields {Element} DOM component
 */
function ProductSelector(_ref) {
  var _this = this;

  var selectedIncludes, possibleAddons, removeItemOpen, addItemOpen, addItemId, removeItemId, handleMouseUp, handleSelectorOpen, _iterator, _step, _step$value;

  return regeneratorRuntime.wrap(function ProductSelector$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          selectedIncludes = _ref.selectedIncludes, possibleAddons = _ref.possibleAddons;

          /**
           * Display remove item selection menu if active
           *
           * @member removeItemOpen
           * @type {boolean}
           */
          removeItemOpen = false;
          /**
           * Display add item selection menu if active
           *
           * @member addItemOpen
           * @type {boolean}
           */

          addItemOpen = false;
          /**
           * Selector id for add item select menu
           *
           * @member addItemId
           * @type {string}
           */

          addItemId = "addItem";
          /**
           * Selector id for remove item select menu
           *
           * @member removeItemId
           * @type {string}
           */

          removeItemId = "removeItem";
          /**
           * Handle mouse up on selected components
           *
           * @function handleMouseUp
           * @param {object} ev The firing event
           * @listens click
           */

          handleMouseUp = function handleMouseUp(ev) {
            var id;

            if (ev.target.tagName === "BUTTON") {
              switch (ev.target.id) {
                case addItemId:
                  _this.dispatchEvent((0, _events.selectorOpenEvent)(addItemId));

                  break;

                case removeItemId:
                  _this.dispatchEvent((0, _events.selectorOpenEvent)(removeItemId));

                  break;
              }
            } else if (ev.target.tagName === "DIV") {
              switch (ev.target.getAttribute("name")) {
                case addItemId:
                  _this.dispatchEvent((0, _events.selectorOpenEvent)(null));

                  id = ev.target.getAttribute("data-item");

                  _this.dispatchEvent((0, _events.moveProductEvent)(id, "possibleAddons", "selectedAddons"));

                  break;

                case removeItemId:
                  _this.dispatchEvent((0, _events.selectorOpenEvent)(null));

                  id = ev.target.getAttribute("data-item");

                  _this.dispatchEvent((0, _events.moveProductEvent)(id, "selectedIncludes", "selectedExcludes"));

                  break;

                case "possibleAddons":
                  id = ev.target.getAttribute("data-item");

                  _this.dispatchEvent((0, _events.moveProductEvent)(id, "possibleAddons", "selectedAddons"));

                  break;
              }
            }
          };

          this.addEventListener("mouseup", handleMouseUp);
          /**
           * Handle selector open event, if matching selectorId the menu is open, else close
           *
           * @function handleSelectorOpen
           * @param {object} ev The firing event
           * @listens selectorOpenEvent
           */

          handleSelectorOpen = function handleSelectorOpen(ev) {
            if (addItemId === ev.detail.selector) {
              addItemOpen = !addItemOpen;
              removeItemOpen = false;
            } else if (removeItemId === ev.detail.selector) {
              removeItemOpen = !removeItemOpen;
              addItemOpen = false;
            } else {
              addItemOpen = false;
              removeItemOpen = false;
            }

            _this.refresh();
          };

          this.addEventListener("selectorOpenEvent", handleSelectorOpen);
          _iterator = _createForOfIteratorHelper(this);
          _context.prev = 10;

          _iterator.s();

        case 12:
          if ((_step = _iterator.n()).done) {
            _context.next = 20;
            break;
          }

          _step$value = _step.value;
          selectedIncludes = _step$value.selectedIncludes;
          possibleAddons = _step$value.possibleAddons;
          _context.next = 18;
          return (0, _cjs.createElement)("div", {
            id: "productSelector",
            "class": "absolute o-0"
          }, (0, _cjs.createElement)("div", null, selectedIncludes.length > 0 && (0, _cjs.createElement)(_selectMenu["default"], {
            id: removeItemId,
            menu: selectedIncludes.map(function (el) {
              return {
                text: el.shopify_title,
                item: el.shopify_product_id
              };
            }),
            title: "Remove items from your box",
            active: removeItemOpen
          }, "Select items you'd prefer not to receive\xA0\xA0\xA0\u25BE"), possibleAddons.length > 0 && (0, _cjs.createElement)(_selectMenu["default"], {
            id: addItemId,
            menu: possibleAddons.map(function (el) {
              return {
                text: el.shopify_title,
                item: el.shopify_product_id
              };
            }),
            title: "Add items to your box",
            active: addItemOpen
          }, "Select items you'd like to add to the box\xA0\xA0\xA0\u25BE")), (0, _cjs.createElement)("div", {
            "class": "ttu b pt2"
          }, "Available Products"), (0, _cjs.createElement)("div", {
            "class": "bb b--silver pv2 fl"
          }, possibleAddons.map(function (el) {
            return (0, _cjs.createElement)("div", {
              "class": "pointer fl f6 ph3 ma1 ba br-pill b--streamside-maroon bg-streamside-maroon white",
              "data-item": el.shopify_product_id,
              "data-title": el.shopify_title,
              name: "possibleAddons",
              title: "Add into your box"
            }, el.shopify_title, " ", (0, _price["default"])(el));
          })));

        case 18:
          _context.next = 12;
          break;

        case 20:
          _context.next = 25;
          break;

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](10);

          _iterator.e(_context.t0);

        case 25:
          _context.prev = 25;

          _iterator.f();

          return _context.finish(25);

        case 28:
        case "end":
          return _context.stop();
      }
    }
  }, _marked, this, [[10, 22, 25, 28]]);
}

;

var _default = (0, _animationWrapper["default"])(ProductSelector);

exports["default"] = _default;
});

require.register("components/container/quantity-form.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

var _events = require("../events");

var _price = _interopRequireDefault(require("../price"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/** @jsx createElement */

/**
 * Form for editing quantities
 *
 * @module app/quantity-form
 * @exports {Element} QuantityForm
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Component to update quantities in box
 *
 * @returns {Element} DOM component
 */
function QuantityForm(_ref) {
  var _this = this;

  var selectedIncludes = _ref.selectedIncludes,
      selectedAddons = _ref.selectedAddons;
  var titleStyle = "pa2 ba outline-0 w-70 input-reset br2 bt bb bl br-0 br--left";
  var quantityStyle = "pa2 ba w-10 input-reset br2 ba br--left br--right";
  var priceStyle = "pa2 ba outline-0 w-20 input-reset br2 bt bb br bl-0 br--right";

  var toPrice = function toPrice(num) {
    return "$".concat((num * 0.01).toFixed(2));
  };

  var TitleInput = function TitleInput(_ref2) {
    var el = _ref2.el;
    return (0, _cjs.createElement)("input", {
      "class": titleStyle,
      type: "text",
      readonly: true,
      name: "title",
      value: "".concat(el.shopify_title, " (").concat(toPrice(el.shopify_price), ")")
    });
  };

  var QuantityInput = function QuantityInput(_ref3) {
    var el = _ref3.el,
        id = _ref3.id;
    return (0, _cjs.createElement)("input", {
      "class": quantityStyle,
      type: "number",
      steps: "1",
      min: "0",
      name: "quantity",
      "data-id": id,
      id: el.shopify_product_id,
      value: el.quantity,
      autocomplete: "off"
    });
  };

  var PriceInput = function PriceInput(_ref4) {
    var el = _ref4.el,
        includes = _ref4.includes;
    return (0, _cjs.createElement)("input", {
      "class": priceStyle,
      type: "text",
      readonly: true,
      name: "title",
      value: (0, _price["default"])(el, includes)
    });
  };
  /** 
   * Map strings to the lists
   *
   * @function listMap
   */


  var listMap = function listMap(str) {
    var list;

    switch (str) {
      case 'selectedAddons':
        list = selectedAddons;
        break;

      case 'selectedIncludes':
        list = selectedIncludes;
        break;
    }

    return list;
  };
  /**
   * Handle change on selected input elements
   *
   * @function handleChange
   * @param {object} ev The firing event
   * @listens change
   */


  var handleChange = function handleChange(ev) {
    if (ev.target.tagName === "INPUT") {
      if (ev.target.name === "quantity") {
        _this.dispatchEvent((0, _events.quantityUpdateEvent)(ev.target.id, ev.target.value, ev.target.getAttribute("data-id")));
      }
    }
  };

  this.addEventListener("change", handleChange);
  return (0, _cjs.createElement)("div", {
    "class": "relative"
  }, (0, _cjs.createElement)("div", {
    "class": "absolute w-100 ba bg-near-white z-9999"
  }, (0, _cjs.createElement)("button", {
    "class": "bn outline-0 bg-transparent pa0 no-underline mid-gray dim o-70 absolute top-0 right-1",
    name: "close",
    type: "button",
    id: "qtyFormClose",
    title: "Close modal"
  }, "\u2716", (0, _cjs.createElement)("span", {
    "class": "dn"
  }, "Close modal")), (0, _cjs.createElement)("div", {
    "class": "pa2 bg-white"
  }, (0, _cjs.createElement)("p", {
    "class": "fw2 ttu tracked mt2 mb1 f7 tc"
  }, "Included:"), selectedIncludes.map(function (el) {
    return (0, _cjs.createElement)("div", {
      "class": "mv1 center"
    }, (0, _cjs.createElement)(TitleInput, {
      el: el
    }), (0, _cjs.createElement)(QuantityInput, {
      el: el,
      id: "selectedIncludes"
    }), (0, _cjs.createElement)(PriceInput, {
      el: el,
      includes: true
    }));
  }), selectedAddons.length > 0 && (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)("p", {
    "class": "fw2 ttu tracked mt2 mb1 f7 tc"
  }, "Extras:"), selectedAddons.map(function (el) {
    return (0, _cjs.createElement)("div", {
      "class": "mv1 center"
    }, (0, _cjs.createElement)(TitleInput, {
      el: el
    }), (0, _cjs.createElement)(QuantityInput, {
      el: el,
      id: "selectedAddons"
    }), (0, _cjs.createElement)(PriceInput, {
      el: el,
      includes: false
    }));
  })), (0, _cjs.createElement)("div", {
    "class": "tr"
  }, (0, _cjs.createElement)("button", {
    "class": "f6 pv1 ph2 ma1 outline-0 bg-light-gray dark-gray b--gray ba br2 pointer",
    name: "close",
    type: "button",
    id: "qtyFormClose",
    title: "Close modal"
  }, "Close")))));
}

;
var _default = QuantityForm;
exports["default"] = _default;
});

require.register("components/error.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Error component
 *
 * @returns {Element} DOM component
 * @param {object} props  Component properties
 * @param {Element|string|object} props.msg Error to be displayed
 * @example
 * { error && <ErrorMsg msg="Some error message" /> }
 */
var ErrorMsg = function ErrorMsg(_ref) {
  var msg = _ref.msg;

  // console.log(msg, typeof msg, isElement(msg));
  if (typeof msg === "string" || (0, _cjs.isElement)(msg)) {
    return (0, _cjs.createElement)("div", {
      "class": "dark-red mv2 pt2 pl2 br3 ba b--dark-red bg-washed-red"
    }, (0, _cjs.createElement)("p", {
      "class": "tc"
    }, msg));
  }

  if (_typeof(msg) === "object" || !msg.msg) {
    return (0, _cjs.createElement)("div", {
      "class": "dark-red mv2 pt2 pl2 br3 ba b--dark-red bg-washed-red"
    }, (0, _cjs.createElement)("p", {
      "class": "tc"
    }, msg.toString()));
  }

  return (0, _cjs.createElement)("div", {
    "class": "dark-red mv2 pt2 pl2 br3 ba b--dark-red bg-washed-red"
  }, (0, _cjs.createElement)("p", {
    "class": "tc"
  }, msg.msg, ":", msg.err));
};

var _default = ErrorMsg;
exports["default"] = _default;
});

require.register("components/events.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quantityUpdateEvent = exports.selectorOpenEvent = exports.selectDateEvent = exports.moveProductEvent = void 0;

/**
 * Event dispatched by Product selectors in ProductSelector
 * Listened for by ContainerBox and moves products between lists
 *
 * @function moveProductEvent
 * @param {string} product The id
 * @param {string} from Identify the from list
 * @param {string} to Identify the target list
 */
var moveProductEvent = function moveProductEvent(id, from, to) {
  return new CustomEvent("moveProductEvent", {
    bubbles: true,
    detail: {
      id: id,
      from: from,
      to: to
    }
  });
};
/**
 * Event dispatched by DateSelector and listened for by ContainerBox
 * @function selectDateEvent
 * @param {string} date The date string selected,
 */


exports.moveProductEvent = moveProductEvent;

var selectDateEvent = function selectDateEvent(date) {
  return new CustomEvent("selectDateEvent", {
    bubbles: true,
    detail: {
      date: date
    }
  });
};
/**
 * Event dispatched by all selectors so that the others can be closed if open
 * @function selectorOpen
 * @param {string} selector The string indentifier that is open, the rest will close
 */


exports.selectDateEvent = selectDateEvent;

var selectorOpenEvent = function selectorOpenEvent(selector) {
  return new CustomEvent("selectorOpenEvent", {
    bubbles: true,
    detail: {
      selector: selector
    }
  });
};
/**
 * Event dispatched by quantity form when quantity updated
 * @function quantityUpdateEvent
 * @param {string} product The id
 * @param {string} from Identify the from list
 * @param {string} to Identify the target list
 */


exports.selectorOpenEvent = selectorOpenEvent;

var quantityUpdateEvent = function quantityUpdateEvent(id, quantity, list) {
  return new CustomEvent("quantityUpdateEvent", {
    bubbles: true,
    detail: {
      id: id,
      quantity: quantity,
      list: list
    }
  });
};

exports.quantityUpdateEvent = quantityUpdateEvent;
});

require.register("components/fetch.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PostFetch = exports.Fetch = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * Fetch components
 *
 * @module app/lib/fetch
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Fetch component that attempts to deal reasonably if the fetch fails. Always
 * uses a `GET` request` and expects a `json` response.
 *
 * @returns {Promise} A promise resolving to { error, json }
 * @param {string} src Url to send request
 * @example
 * const src
 * Fetch(src)
 *   .then((result) => {
 *     const { error, json } = result;
 *   })
 */
var Fetch = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(src) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", fetch(src).then( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(response) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!(response.status !== 200)) {
                          _context.next = 8;
                          break;
                        }

                        _context.t0 = Error;
                        _context.t1 = JSON;
                        _context.next = 5;
                        return response.json();

                      case 5:
                        _context.t2 = _context.sent;
                        _context.t3 = _context.t1.stringify.call(_context.t1, _context.t2);
                        throw new _context.t0(_context.t3);

                      case 8:
                        return _context.abrupt("return", response.json());

                      case 9:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x2) {
                return _ref2.apply(this, arguments);
              };
            }()).then(function (json) {
              //console.log("Got this in GET fetch:", json);
              return {
                error: null,
                json: json
              };
            })["catch"](function (error) {
              console.warn("Got error in GET fetch:", error);

              if (Object.prototype.hasOwnProperty.call(error, "err")) {
                return {
                  error: error.err,
                  json: null
                };
              }

              return {
                error: error,
                json: null
              };
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function Fetch(_x) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * PostFetch component that attempts to deal reasonably if the fetch fails. Always
 * uses a `POST` request` and expects a `json` response.
 *
 * @returns {Promise} A promise resolving to { error, json }
 * @param {object} opts Dicitonary of options
 * @param {string} opts.src Url to send request to
 * @param {string} opts.data Data to be sent with request
 * @param {string} opts.headers Headers to send data with, usually `{"Content-Type": "application/json"}` but not when uploading files.
 * @example
 * const src = "api/create-todo";
 * const data = {title: "Fix me"};
 * const headers = { "Content-Type": "application/json" };
 * PostFetch({src, data, headers})
 *   .then((result) => {
 *     const { error, json } = result;
 *   })
 */


exports.Fetch = Fetch;

var PostFetch = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref3) {
    var src, data, headers, formdata, opts;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            src = _ref3.src, data = _ref3.data, headers = _ref3.headers;
            // use json if according to content-type
            formdata = headers["Content-Type"] === "application/json" ? JSON.stringify(data) : data;
            opts = {
              method: "POST",
              body: formdata
            }; // add headers if set in arguments - i.e. using none if sending files

            if (headers) opts.headers = headers;
            return _context4.abrupt("return", fetch(src, opts).then( /*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(response) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        if (!(response.status !== 200)) {
                          _context3.next = 8;
                          break;
                        }

                        _context3.t0 = Error;
                        _context3.t1 = JSON;
                        _context3.next = 5;
                        return response.json();

                      case 5:
                        _context3.t2 = _context3.sent;
                        _context3.t3 = _context3.t1.stringify.call(_context3.t1, _context3.t2);
                        throw new _context3.t0(_context3.t3);

                      case 8:
                        return _context3.abrupt("return", response.json());

                      case 9:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x4) {
                return _ref5.apply(this, arguments);
              };
            }()).then(function (json) {
              //console.log("Got this in POST fetch:", json);
              return {
                error: null,
                json: json
              };
            })["catch"](function (error) {
              console.log("Got error in POST fetch:", error);

              if (Object.prototype.hasOwnProperty.call(error, "err")) {
                return {
                  error: error.err,
                  json: null
                };
              }

              return {
                error: error,
                json: null
              };
            }));

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function PostFetch(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

exports.PostFetch = PostFetch;
});

require.register("components/flash.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

var _marked = /*#__PURE__*/regeneratorRuntime.mark(Flash);

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Flash
 *
 * @returns {Element} DOM component
 */
function Flash(_ref) {
  var children, _iterator, _step;

  return regeneratorRuntime.wrap(function Flash$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          children = _ref.children;

          /*
          this.addEventListener('webkitAnimationEnd', (ev) => {
            console.log('animation ends', ev.target);
            ev.target.classList.add("o-0");
          });
          */
          _iterator = _createForOfIteratorHelper(this);
          _context.prev = 2;

          _iterator.s();

        case 4:
          if ((_step = _iterator.n()).done) {
            _context.next = 10;
            break;
          }

          children = _step.value.children;
          _context.next = 8;
          return (0, _cjs.createElement)("div", {
            "class": "dn flash ba br2 z-max fixed top-2 right-2 pa3"
          }, (0, _cjs.createElement)("div", {
            "class": "tc"
          }, children));

        case 8:
          _context.next = 4;
          break;

        case 10:
          _context.next = 15;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](2);

          _iterator.e(_context.t0);

        case 15:
          _context.prev = 15;

          _iterator.f();

          return _context.finish(15);

        case 18:
          ;

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, _marked, this, [[2, 12, 15, 18]]);
}

;
var _default = Flash;
/*
<div 
  class="fade-out flash ba br2 z-max fixed top-2 pa3 dn" 
>
  <div class="tc">
      { children }
  </div>
</div>
*/

exports["default"] = _default;
});

;require.register("components/icon-cart.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

/** @jsx createElement */

/**
 * Cart Icon
 *
 * @module app/icon-cart
 * @exports {Element} IconCart
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
var IconCart = function IconCart() {
  return (0, _cjs.createElement)("svg", {
    "aria-hidden": "true",
    focusable: "false",
    role: "presentation",
    "class": "icon icon-cart",
    viewBox: "0 0 37 40"
  }, (0, _cjs.createElement)("path", {
    d: "M36.5 34.8L33.3 8h-5.9C26.7 3.9 23 .8 18.5.8S10.3 3.9 9.6 8H3.7L.5 34.8c-.2 1.5.4 2.4.9 3 .5.5 1.4 1.2 3.1 1.2h28c1.3 0 2.4-.4 3.1-1.3.7-.7 1-1.8.9-2.9zm-18-30c2.2 0 4.1 1.4 4.7 3.2h-9.5c.7-1.9 2.6-3.2 4.8-3.2zM4.5 35l2.8-23h2.2v3c0 1.1.9 2 2 2s2-.9 2-2v-3h10v3c0 1.1.9 2 2 2s2-.9 2-2v-3h2.2l2.8 23h-28z"
  }));
};

var _default = IconCart;
exports["default"] = _default;
});

require.register("components/price.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 * Make up a string price
 *
 * @param {number} num The integer number to use
 * @returns {string} Price string
 */
var toPrice = function toPrice(num) {
  return "$".concat((num * 0.01).toFixed(2));
};
/**
 * Figure the price for the element, if it's a standard included product only
 * extra quantities greater than one incur a price
 *
 * @param {object} el The target element
 * @param {boolean} includes Is this a standard included product?
 * @returns {string} Price string
 */


var getPrice = function getPrice(el, includes) {
  return toPrice(el.shopify_price * (includes ? el.quantity - 1 : el.quantity));
};

var _default = getPrice;
exports["default"] = _default;
});

require.register("components/product-box.bak.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("regenerator-runtime/runtime");

var _cjs = require("@bikeshaving/crank/cjs");

var _dom = require("@bikeshaving/crank/cjs/dom");

var _addButton = _interopRequireDefault(require("./add-button.js"));

var _textButton = _interopRequireDefault(require("./text-button.js"));

var _barLoader = _interopRequireDefault(require("./bar-loader.js"));

var _productDescription = _interopRequireDefault(require("./product-description.js"));

var _quantityForm = _interopRequireDefault(require("./container/quantity-form.js"));

var _selectMenu = _interopRequireDefault(require("./select-menu"));

var _flash = _interopRequireDefault(require("./flash"));

var _iconCart = _interopRequireDefault(require("./icon-cart"));

var _fetch = require("./fetch");

var _lib = require("../lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _marked = /*#__PURE__*/regeneratorRuntime.mark(ProductBoxApp);

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * BoxApp crank component
 *
 * @function BoxApp
 * @param {object} props The property object
 * @param {object} props.productJson Shopify product data as extracted from
 * product page json script tag
 * @returns {Element} A crank DOM component
 */

function ProductBoxApp(_ref) {
  var _this = this;

  var productJson, fetchError, cartJson, cartAddons, cartBox, loading, flashMessage, totalPrice, fetchCart;
  return regeneratorRuntime.wrap(function ProductBoxApp$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          productJson = _ref.productJson;

          /**
           * If fetching data was unsuccessful.
           *
           * @member fetchError
           * @type {object|string|null}
           */
          fetchError = null;
          /**
           * If there is a cart and this is the container box
           *
           * @member cartJson
           * @type {object|null}
           */

          cartJson = null;
          /**
           * If there is a cart and these are the addon items
           *
           * @member cartAddons
           * @type {array}
           */

          cartAddons = null;
          /**
           * If there is a cart and this is the container box
           *
           * @member cartBox
           * @type {object|null}
           */

          cartBox = null;
          /**
           * Display loading indicator while fetching data
           *
           * @member loading
           * @type {boolean}
           */

          loading = true;
          /**
           * A message to the user - on 4s fade out
           *
           * @member flashMessage
           * @type {string}
           */

          flashMessage = "";
          /**
           * The total price TODO here in development udating on refresh - production
           * may actuall use priceElement as above
           *
           * @member priceElement
           * @type {Element}
           */

          totalPrice = productJson.variants[0].price;
          /**
           * Uses fetch to collect current cart for the session 
           *
           * @function fetchCart
           */

          fetchCart = /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
              var _yield$Fetch, error, json, match;

              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return (0, _fetch.Fetch)("/cart.js");

                    case 2:
                      _yield$Fetch = _context.sent;
                      error = _yield$Fetch.error;
                      json = _yield$Fetch.json;

                      if (!error) {
                        _context.next = 10;
                        break;
                      }

                      fetchError = error;

                      _this.refresh();

                      _context.next = 23;
                      break;

                    case 10:
                      if (json.items) {
                        _context.next = 14;
                        break;
                      }

                      fetchError = "Failed to load cart data";

                      _this.refresh();

                      return _context.abrupt("return");

                    case 14:
                      console.log(json);
                      cartJson = json;
                      cartBox = json.items.find(function (el) {
                        return el.product_type === "Container Box";
                      });
                      cartAddons = json.items.filter(function (el) {
                        return el.product_type === "Box Produce";
                      });
                      console.log(cartBox); // Can we match this product to a cart item?

                      match = json.items.find(function (el) {
                        return productJson.variants.find(function (variant) {
                          return variant.id === parseInt(el.variant_id);
                        });
                      });

                      if (typeof match === "undefined") {
                        // no we don't
                        console.log('no');
                      } else {
                        console.log('yes'); // use fetch to get container box data and disply image etc - can't do
                        // so here without providing api authentication but probably can when
                        // within the site itself, including credentials. So settle for the
                        // moment with providing title and whatever else we can glean from the
                        // cart data.
                        // so what to do now 1. show thus, 2. give the option to add to box?
                      }

                      loading = false;

                      _this.refresh();

                    case 23:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            }));

            return function fetchCart() {
              return _ref2.apply(this, arguments);
            };
          }();

          fetchCart();

        case 10:
          if (!true) {
            _context2.next = 15;
            break;
          }

          _context2.next = 13;
          return (0, _cjs.createElement)("div", {
            "class": "mt2 sans-serif center measure"
          }, fetchError && (0, _cjs.createElement)(Error, {
            msg: fetchError
          }), !loading ? (0, _cjs.createElement)(_cjs.Fragment, null, flashMessage && (0, _cjs.createElement)(_flash["default"], null, flashMessage), cartBox && (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)(_iconCart["default"], null), (0, _cjs.createElement)("div", null, cartBox.title, " ", cartBox.properties["Delivery Date"]), (0, _cjs.createElement)("div", null, cartJson.total_price), (0, _cjs.createElement)("div", null, cartAddons.map(function (el) {
            return (0, _cjs.createElement)("div", null, el.title, " ", el.quantity, " ", el.properties["Delivery Date"]);
          })))) : (0, _cjs.createElement)("div", null, "Here?"));

        case 13:
          _context2.next = 10;
          break;

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked);
}

var _default = ProductBoxApp;
exports["default"] = _default;
});

require.register("components/product-box.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("regenerator-runtime/runtime");

var _cjs = require("@bikeshaving/crank/cjs");

var _dom = require("@bikeshaving/crank/cjs/dom");

var _addButton = _interopRequireDefault(require("./add-button.js"));

var _textButton = _interopRequireDefault(require("./text-button.js"));

var _barLoader = _interopRequireDefault(require("./bar-loader.js"));

var _productDescription = _interopRequireDefault(require("./product-description.js"));

var _quantityForm = _interopRequireDefault(require("./container/quantity-form.js"));

var _selectMenu = _interopRequireDefault(require("./select-menu"));

var _flash = _interopRequireDefault(require("./flash"));

var _iconCart = _interopRequireDefault(require("./icon-cart"));

var _fetch = require("./fetch");

var _lib = require("../lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _awaitAsyncGenerator(value) { return new _AwaitValue(value); }

function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }

function _AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; var wrappedAwait = value instanceof _AwaitValue; Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) { if (wrappedAwait) { resume(key === "return" ? "return" : "next", arg); return; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen["return"] !== "function") { this["return"] = undefined; } }

if (typeof Symbol === "function" && Symbol.asyncIterator) { _AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; }

_AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };

_AsyncGenerator.prototype["throw"] = function (arg) { return this._invoke("throw", arg); };

_AsyncGenerator.prototype["return"] = function (arg) { return this._invoke("return", arg); };

function _AwaitValue(value) { this.wrapped = value; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * BoxApp crank component
 *
 * @generator
 * @param {object} props The property object
 * @param {object} props.productJson Shopify product data as extracted from
 * product page json script tag
 * @yields {Element} A crank DOM component
 */

function ProductBoxApp(_x) {
  return _ProductBoxApp.apply(this, arguments);
}

function _ProductBoxApp() {
  _ProductBoxApp = _wrapAsyncGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref) {
    var _this = this;

    var productJson, fetchError, fetchJson, fetchBoxes, cartJson, cartBox, inCart, loading, baseUrl, totalPrice, init, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, _value2;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            productJson = _ref.productJson;

            /**
             * If fetching data was unsuccessful.
             *
             * @member fetchError
             * @type {object|string|null}
             */
            fetchError = null;
            /**
             * Contains box data as collected from api/current-boxes-for-box-product,
             * these are the boxes of which this product is either an included product or
             * possible add on.
             *
             * @member fetchJson
             * @type {object}
             */

            fetchJson = {};
            /**
             * The box ids: Object.keys(fetchJson)
             *
             * @member fetchDates
             * @type {object}
             */

            fetchBoxes = [];
            /**
             * Contains cart data collected from html template json data
             * This will then also contain a selected date
             *
             * @member cartJson
             * @type {object}
             */

            _context3.next = 6;
            return _awaitAsyncGenerator(JSON.parse(document.querySelector("#cart-json").textContent));

          case 6:
            cartJson = _context3.sent;

            /**
             * If there is a cart and this is the container box
             *
             * @member cartBox
             * @type {object|null}
             */
            cartBox = null;
            /**
            * This current product is included in the cart container box
             *
             * @member productInCart
             * @type {boolean}
             */

            inCart = false;
            /**
             * Display loading indicator while fetching data
             *
             * @member loading
             * @type {boolean}
             */

            loading = true;
            /**
             * Base url to api
             *
             * @member baseUrl
             * @type {string}
             */

            baseUrl = "https://streamsidedev.cousinsd.net/api/";
            /**
             * The cart price??
             *
             * @member priceElement
             * @type {Element}
             */

            totalPrice = productJson.variants[0].price;
            /**
             * Gather box includes for display, watch for dates, cart items and date
             * already selected from collection
             *
             * @function init
             */

            init = /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        console.log(productJson.id);
                        _context2.next = 3;
                        return (0, _fetch.Fetch)("".concat(baseUrl, "current-boxes-for-box-product/").concat(productJson.id)).then( /*#__PURE__*/function () {
                          var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref3) {
                            var error, json, addOn, included, _iterator2, _step2, item;

                            return regeneratorRuntime.wrap(function _callee$(_context) {
                              while (1) {
                                switch (_context.prev = _context.next) {
                                  case 0:
                                    error = _ref3.error, json = _ref3.json;

                                    if (error) {
                                      fetchError = error;
                                    } else {
                                      if (Object.keys(json).length > 0) {
                                        fetchBoxes = Object.keys(json);
                                        fetchJson = json;
                                        addOn = [];
                                        included = [];
                                        Object.entries(fetchJson).forEach(function (_ref5) {
                                          var _ref6 = _slicedToArray(_ref5, 2),
                                              id = _ref6[0],
                                              byDeliveryDate = _ref6[1];

                                          byDeliveryDate.forEach(function (box) {
                                            console.log(box);

                                            if (box.addOnProduct) {}

                                            if (box.includedProduct) {}
                                          });
                                        });
                                      }
                                    } // in both the following circumstances we should present entire edit box


                                    if (cartJson.items) {
                                      // find the selected date from the items
                                      _iterator2 = _createForOfIteratorHelper(cartJson.items);

                                      try {
                                        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                                          item = _step2.value;

                                          if (item.product_type === "Container Box") {
                                            // get the delivery date regardless of which box
                                            cartBox = item;
                                            cartBox.deliveryDate = item.properties["Delivery Date"]; // group by applicable type
                                          }

                                          if (item.product_type === "Box Produce") {
                                            // these are included in the box as addons
                                            if (item.product_id === productJson.id) {
                                              // this product is in the cart
                                              inCart = true;
                                            }
                                          }
                                        }
                                      } catch (err) {
                                        _iterator2.e(err);
                                      } finally {
                                        _iterator2.f();
                                      }
                                    }

                                    loading = false;

                                    _this.refresh();

                                  case 5:
                                  case "end":
                                    return _context.stop();
                                }
                              }
                            }, _callee);
                          }));

                          return function (_x2) {
                            return _ref4.apply(this, arguments);
                          };
                        }());

                      case 3:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function init() {
                return _ref2.apply(this, arguments);
              };
            }();

            _context3.next = 15;
            return _awaitAsyncGenerator(init());

          case 15:
            // set up script
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context3.prev = 17;
            _iterator = _asyncIterator(this);

          case 19:
            _context3.next = 21;
            return _awaitAsyncGenerator(_iterator.next());

          case 21:
            _step = _context3.sent;
            _iteratorNormalCompletion = _step.done;
            _context3.next = 25;
            return _awaitAsyncGenerator(_step.value);

          case 25:
            _value = _context3.sent;

            if (_iteratorNormalCompletion) {
              _context3.next = 34;
              break;
            }

            _value2 = _value;
            productJson = _value2.productJson;
            _context3.next = 31;
            return (0, _cjs.createElement)("div", {
              "class": "mt2 sans-serif center measure"
            }, fetchError && (0, _cjs.createElement)(Error, {
              msg: fetchError
            }), !loading ? (0, _cjs.createElement)(_cjs.Fragment, null, cartBox && (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)(_iconCart["default"], null), (0, _cjs.createElement)("a", {
              href: cartBox.url
            }, (0, _cjs.createElement)("img", {
              width: "100",
              src: cartBox.image,
              alt: cartBox.product_title
            })), (0, _cjs.createElement)("div", null, cartBox.title, " ", cartBox.deliveryDate), (0, _cjs.createElement)("div", null, cartJson.total_price), fetchBoxes.map(function (el) {
              return (0, _cjs.createElement)(_cjs.Fragment, null, fetchJson[el].map(function (box) {
                return (0, _cjs.createElement)("div", null, box.shopify_title, " ", box.delivered, (0, _cjs.createElement)("span", null, "\xA0", box.addOnProduct && "Add on product", box.includedProduct && "Included product"));
              }));
            })), !cartBox && (0, _cjs.createElement)(_cjs.Fragment, null, Object.entries(fetchJson).map(function (_ref7) {
              var _ref8 = _slicedToArray(_ref7, 2),
                  id = _ref8[0],
                  byDeliveryDate = _ref8[1];

              return (0, _cjs.createElement)(_cjs.Fragment, null, byDeliveryDate.map(function (box) {
                return (0, _cjs.createElement)("div", null, box.shopify_title, " ", box.delivered, (0, _cjs.createElement)("span", null, "\xA0", box.addOnProduct && "Add on product", box.includedProduct && "Included product"));
              }));
            }))) : (0, _cjs.createElement)(_barLoader["default"], null));

          case 31:
            _iteratorNormalCompletion = true;
            _context3.next = 19;
            break;

          case 34:
            _context3.next = 40;
            break;

          case 36:
            _context3.prev = 36;
            _context3.t0 = _context3["catch"](17);
            _didIteratorError = true;
            _iteratorError = _context3.t0;

          case 40:
            _context3.prev = 40;
            _context3.prev = 41;

            if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
              _context3.next = 45;
              break;
            }

            _context3.next = 45;
            return _awaitAsyncGenerator(_iterator["return"]());

          case 45:
            _context3.prev = 45;

            if (!_didIteratorError) {
              _context3.next = 48;
              break;
            }

            throw _iteratorError;

          case 48:
            return _context3.finish(45);

          case 49:
            return _context3.finish(40);

          case 50:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[17, 36, 40, 50], [41,, 45, 49]]);
  }));
  return _ProductBoxApp.apply(this, arguments);
}

var _default = ProductBoxApp;
exports["default"] = _default;
});

require.register("components/product-description.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

/** @jsx createElement */

/**
 * The product description and image, this is a temporary component while
 * developing
 *
 * @module app/product-description
 * @exports {Element} ProductDescription
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Product description component - for development only
 *
 * @returns {Element} DOM component
 */
var ProductDescription = function ProductDescription(_ref) {
  var product = _ref.product,
      price = _ref.price;
  return (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)("h3", {
    "class": "center"
  }, product.title), (0, _cjs.createElement)("div", {
    "class": "w-100 vh-25 overflow-hidden"
  }, (0, _cjs.createElement)("img", {
    src: "https:".concat(product.featured_image),
    title: product.title,
    "class": "br2"
  })), (0, _cjs.createElement)("div", {
    "class": "pa2 dt w-100 mb1"
  }, (0, _cjs.createElement)("div", {
    "class": "dtc w-third b black"
  }, (0, _cjs.createElement)("span", {
    "class": "black price-item price-item--regular",
    "data-regular-price": true
  }, "$", (price * 0.01).toFixed(2))), (0, _cjs.createElement)("div", {
    "class": "dtc fw3"
  }, product.title), (0, _cjs.createElement)("div", {
    "class": "dtc tr"
  }, product.id)));
};

var _default = ProductDescription;
exports["default"] = _default;
});

require.register("components/select-menu.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

var _textButton = _interopRequireDefault(require("./text-button.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/** @jsx createElement */

/**
 * Component
 *
 * @module app/product-description
 * @exports {Element} SelectDeliveryDate
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Component
 *
 * @returns {Element} DOM component
 * <SelectMenu id="selectDate" menu={fetchDates} title="Select Date" active={menuSelectDate} />
 */
var SelectMenu = function SelectMenu(_ref) {
  var id = _ref.id,
      active = _ref.active,
      title = _ref.title,
      menu = _ref.menu,
      children = _ref.children;
  var type = id.startsWith("selectDate") ? "ttu tracked" : "";
  return (0, _cjs.createElement)(_cjs.Fragment, null, (0, _cjs.createElement)("button", {
    "class": "dib w-100 f6 ".concat(type, " outline-0 gray b--gray ba ba1 bg-transparent br2 pa2 mb1 pointer"),
    title: title,
    id: id,
    type: "button"
  }, children), active && (0, _cjs.createElement)("div", {
    "class": "absolute w-100 bg-white br2 z-max"
  }, menu.map(function (el, idx, arr) {
    return (0, _cjs.createElement)(_textButton["default"], {
      text: el.text,
      index: idx,
      array: arr,
      name: id,
      item: el.item
    });
  })));
};

var _default = SelectMenu;
exports["default"] = _default;
});

require.register("components/text-button.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

/** @jsx createElement */

/**
 *
 * @module app/form/filter-select
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Renders a select field for generating filters
 *
 * @generator
 * @param {object} props The property object
 * @param {string} props.text The display text - will be slugified to create name/id
 * @param {number} props.index The index of the menu array - used to add borders and border radius to group multiple items
 * @param {array} props.array The menu array that this is a part of
 * @param {string} props.title Text used for visual hint on hover
 * @param {string} props.name Used to identify the action when listening for click on the component
 * @param {string|number} props.item Added to `data-item` attribute and is the object collected and used in final action
 * @yields {Element} A select field
 */
function TextButton(_ref) {
  var text = _ref.text,
      index = _ref.index,
      array = _ref.array,
      title = _ref.title,
      name = _ref.name,
      item = _ref.item;

  /**
   * Style selection according to props.position to add rounded corners as
   * necessary to render grouped elements
   *
   * @member {string}
   */
  var position;

  switch (index) {
    case 0:
      position = "top";
      break;

    case array.length - 1:
      position = "bottom";
      break;

    default:
      position = "center";
  }

  if (array.length === 1) position = "single";
  var borders = "ba";
  if (position === "top") borders = "br bl bt bb-0 br2 br--top";
  if (position === "center") borders = "bl br bb-0 bt-0 br--top br2 br--top br--bottom";
  if (position === "bottom") borders = "br bl bb bt-0 br2 br--bottom";
  if (position === "single") borders = "ba br2";
  var slug = text.replace(/ /g, '-');
  var type = name === "selectDate" ? "ttu tracked" : "";
  return (0, _cjs.createElement)("button", {
    "class": "w-100 f6 ".concat(type, " outline-0 dark-gray b--gray ").concat(borders, " bg-transparent pointer pa0"),
    title: text,
    name: slug,
    id: slug,
    type: "button"
  }, (0, _cjs.createElement)("div", {
    name: name,
    "class": "dim bg-animate hover-bg-near-white pa1",
    "data-item": item,
    "data-title": text
  }, text));
}

var _default = TextButton;
exports["default"] = _default;
});

require.register("helpers.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortObjectByKey = exports.sortObjectByKeys = void 0;

/* eslint-disable */

/**
 * Provide some helper methods
 *
 * @module app/helpers
 */

/**
 * Sort an object by it's keys.
 *
 * @function sortObjectByKeys
 * @param {object} o An object
 * @returns {object} The sorted object
 * @example
 * sortObjectByKeys({'c': 0, 'a': 2, 'b': 1});
 * // returns {'a': 2, 'b': 1, 'c': 0}
 */
var sortObjectByKeys = function sortObjectByKeys(o) {
  return Object.keys(o).sort().reduce(function (r, k) {
    return r[k] = o[k], r;
  }, {});
};
/**
 * Sort an array of objects by key.
 *
 * @function sortObjectByKey
 * @param {object} o An object
 * @param {string} key The attribute to sort
 * @returns {object} The sorted object
 * @example
 * sortObjectByKey([{'s1': 5, 's2': 'e'}, {'s1': 2, 's2': 'b'}], 's1');
 * // returns [{'s1': 2, 's2': 'b'}, {'s1': 5, 's2': 'e'}]
 * sortObjectByKey([{'s1': 5, 's2': 'e'}, {'s1': 2, 's2': 'b'}], 's2');
 * // returns [{'s1': 2, 's2': 'b'}, {'s1': 5, 's2': 'e'}]
 */


exports.sortObjectByKeys = sortObjectByKeys;

var sortObjectByKey = function sortObjectByKey(o, key) {
  o.sort(function (a, b) {
    var nameA = a[key];
    var nameB = b[key];

    if (!Number.isInteger) {
      nameA = a[key].toUpperCase(); // ignore upper and lowercase

      nameB = b[key].toUpperCase(); // ignore upper and lowercase
    }

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return o;
};
/**
 * Get the next upcoming date for a particular weekday
 *
 * @function findNextWeekday
 * @param {number} day Integer day of week, Monday -> 0
 * @returns {object} Date object
 */


exports.sortObjectByKey = sortObjectByKey;

var findNextWeekday = function findNextWeekday(day) {
  // return the date of next Thursday as 14/01/2021 for example
  // Thursday day is 4, Saturday is 6
  var now = new Date();
  now.setDate(now.getDate() + (day + (7 - now.getDay())) % 7);
  return now;
};
});

require.register("initialize.js", function(exports, require, module) {
"use strict";

require("regenerator-runtime/runtime");

var _swup = _interopRequireDefault(require("swup"));

var _scrollPlugin = _interopRequireDefault(require("@swup/scroll-plugin"));

var _progressPlugin = _interopRequireDefault(require("@swup/progress-plugin"));

var _collection = _interopRequireDefault(require("./collection"));

var _boxApp = _interopRequireDefault(require("./box-app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var init = function init() {
  var page_type = document.querySelector("#swup").getAttribute("data-page-type");

  switch (page_type) {
    case "index":
      _collection["default"].init();

      break;

    case "collection":
      _collection["default"].init();

      break;

    case "product":
      _boxApp["default"].init();

      break;

    case "page":
      break;
  }

  ;
};

document.addEventListener("DOMContentLoaded", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var swup;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // do your setup here
          //const main = document.querySelectorAll("#swup");
          //console.log('page loaded in transitions, HERE');
          swup = new _swup["default"]({
            cache: false,
            plugins: [new _scrollPlugin["default"]({}), new _progressPlugin["default"]({})],
            containers: ["#swup", "#cartIcon"]
          });
          window.swup = swup;
          init();
          swup.on('contentReplaced', init); //swup.on('willReplaceContent', () => window.observer.disconnect());

        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));
});

require.register("lib.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shallowEqual = shallowEqual;

/**
 * Some library methods
 *
 * @module app/lib
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Shallow compare two objects - adequate from 'flat' objects of key/value pairs
 *
 * @returns {boolean} Returns true if shallow comparison passes
 * @param {object} object1 Object to compare
 * @param {object} object2 Other object to compare
 * @example
 * const o1 = {me: 'dc', you: 'mh'};
 * const o2 = {me: 'dc', you: 'mh'};
 * shallowEqual(o1, o2) // true
 */
function shallowEqual(object1, object2) {
  var keys1 = Object.keys(object1);
  var keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (var _i = 0, _keys = keys1; _i < _keys.length; _i++) {
    var key = _keys[_i];

    if (object1[key] !== object2[key]) {
      return false;
    }
  }

  return true;
}
});

require.register("template.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cjs = require("@bikeshaving/crank/cjs");

/** @jsx createElement */

/**
 * Component
 *
 * @module app/product-description
 * @exports {Element} Template
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Component
 *
 * @returns {Element} DOM component
 */
var Template = function Template() {
  return (0, _cjs.createElement)("div", null, "Template");
};

var _default = Template;
exports["default"] = _default;
});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map