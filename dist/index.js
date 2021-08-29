/***/ 241:
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/***/ 186:
const command_1 = __nccwpck_require__(241);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/***/ 278:
/***/ 53:
const fs_1 = __nccwpck_require__(747);
const os_1 = __nccwpck_require__(87);
/***/ 438:
const Context = __importStar(__nccwpck_require__(53));
const utils_1 = __nccwpck_require__(30);
/***/ 914:
const httpClient = __importStar(__nccwpck_require__(925));
/***/ 30:
const Context = __importStar(__nccwpck_require__(53));
const Utils = __importStar(__nccwpck_require__(914));
const core_1 = __nccwpck_require__(762);
const plugin_rest_endpoint_methods_1 = __nccwpck_require__(44);
const plugin_paginate_rest_1 = __nccwpck_require__(193);
/***/ 925:
const http = __nccwpck_require__(605);
const https = __nccwpck_require__(211);
const pm = __nccwpck_require__(443);
                tunnel = __nccwpck_require__(294);
/***/ 443:
/***/ 762:
var universalUserAgent = __nccwpck_require__(429);
var beforeAfterHook = __nccwpck_require__(682);
var request = __nccwpck_require__(234);
var graphql = __nccwpck_require__(668);
/***/ 440:
var isPlainObject = __nccwpck_require__(287);
var universalUserAgent = __nccwpck_require__(429);
/***/ 668:
var request = __nccwpck_require__(234);
var universalUserAgent = __nccwpck_require__(429);
/***/ 193:
/***/ 44:
var deprecation = __nccwpck_require__(932);
var once = _interopDefault(__nccwpck_require__(223));
/***/ 234:
var endpoint = __nccwpck_require__(440);
var universalUserAgent = __nccwpck_require__(429);
var isPlainObject = __nccwpck_require__(287);
/***/ 682:
var register = __nccwpck_require__(670)
var addHook = __nccwpck_require__(549)
var removeHook = __nccwpck_require__(819)
// bind with array of arguments: https://stackoverflow.com/a/21792913
var bind = Function.bind
var bindable = bind.bind(bind)
function bindApi (hook, state, name) {
  var removeHookRef = bindable(removeHook, null).apply(null, name ? [state, name] : [state])
  hook.api = { remove: removeHookRef }
  hook.remove = removeHookRef
  ;['before', 'error', 'after', 'wrap'].forEach(function (kind) {
    var args = name ? [state, kind, name] : [state, kind]
    hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args)
  })
function HookSingular () {
  var singularHookName = 'h'
  var singularHookState = {
    registry: {}
  }
  var singularHook = register.bind(null, singularHookState, singularHookName)
  bindApi(singularHook, singularHookState, singularHookName)
  return singularHook
function HookCollection () {
  var state = {
    registry: {}
  }
  var hook = register.bind(null, state)
  bindApi(hook, state)
  return hook
}
var collectionHookDeprecationMessageDisplayed = false
function Hook () {
  if (!collectionHookDeprecationMessageDisplayed) {
    console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4')
    collectionHookDeprecationMessageDisplayed = true
  }
  return HookCollection()
}
Hook.Singular = HookSingular.bind()
Hook.Collection = HookCollection.bind()
module.exports = Hook
// expose constructors as a named property for TypeScript
module.exports.Hook = Hook
module.exports.Singular = Hook.Singular
module.exports.Collection = Hook.Collection
/***/ 549:
/***/ ((module) => {
module.exports = addHook;
function addHook(state, kind, name, hook) {
  var orig = hook;
  if (!state.registry[name]) {
    state.registry[name] = [];
  }
  if (kind === "before") {
    hook = function (method, options) {
      return Promise.resolve()
        .then(orig.bind(null, options))
        .then(method.bind(null, options));
    };
  }
  if (kind === "after") {
    hook = function (method, options) {
      var result;
      return Promise.resolve()
        .then(method.bind(null, options))
        .then(function (result_) {
          result = result_;
          return orig(result, options);
        })
        .then(function () {
          return result;
        });
    };
  }
  if (kind === "error") {
    hook = function (method, options) {
      return Promise.resolve()
        .then(method.bind(null, options))
        .catch(function (error) {
          return orig(error, options);
        });
    };
  }
  state.registry[name].push({
    hook: hook,
    orig: orig,
  });
/***/ }),
/***/ 670:
/***/ ((module) => {
module.exports = register;
function register(state, name, method, options) {
  if (typeof method !== "function") {
    throw new Error("method for before hook must be a function");
  }
  if (!options) {
    options = {};
  }
  if (Array.isArray(name)) {
    return name.reverse().reduce(function (callback, name) {
      return register.bind(null, state, name, callback, options);
    }, method)();
  }
  return Promise.resolve().then(function () {
    if (!state.registry[name]) {
      return method(options);
    }
    return state.registry[name].reduce(function (method, registered) {
      return registered.hook.bind(null, method, options);
    }, method)();
  });
/***/ }),
/***/ 819:
/***/ ((module) => {
module.exports = removeHook;
function removeHook(state, name, method) {
  if (!state.registry[name]) {
    return;
  }
  var index = state.registry[name]
    .map(function (registered) {
      return registered.orig;
    })
    .indexOf(method);
  if (index === -1) {
    return;
  }
  state.registry[name].splice(index, 1);
}
/***/ 932:
/***/ 287:
var Stream = _interopDefault(__nccwpck_require__(413));
var http = _interopDefault(__nccwpck_require__(605));
var Url = _interopDefault(__nccwpck_require__(835));
var https = _interopDefault(__nccwpck_require__(211));
var zlib = _interopDefault(__nccwpck_require__(761));
	convert = __nccwpck_require__(877).convert;
/***/ 223:
var wrappy = __nccwpck_require__(940)
/***/ 833:
/***/ 294:
module.exports = __nccwpck_require__(219);
/***/ 219:
var net = __nccwpck_require__(631);
var tls = __nccwpck_require__(16);
var http = __nccwpck_require__(605);
var https = __nccwpck_require__(211);
var events = __nccwpck_require__(614);
var assert = __nccwpck_require__(357);
var util = __nccwpck_require__(669);
/***/ 429:
/***/ 940:
/***/ 470:
const core = __nccwpck_require__(186);
const {GitHub, context} = __nccwpck_require__(438)
const parse = __nccwpck_require__(833)
/***/ 351:
/* harmony import */ var _grading_js__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(470);
const core = __nccwpck_require__(186);
const github = __nccwpck_require__(438)
    const diff = await (0,_grading_js__WEBPACK_IMPORTED_MODULE_0__/* .default */ .Z)( context, octokit )
     if ( diff.length != 1 ) {
        core.setFailed( "🍐🔥❌ Debes cambiar exactamente 1 fichero, hay ❌" + diff.length + "❌ en el pull request" );
     }
    core.setFailed(error.message);
/***/ 877:
/***/ 357:
/***/ 614:
/***/ 747:
/***/ 605:
/***/ 211:
/***/ 631:
/***/ 87:
/***/ 622:
/***/ 413:
/***/ 16:
/***/ 835:
/***/ 669:
/***/ 761:
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 	var __webpack_exports__ = __nccwpck_require__(351);