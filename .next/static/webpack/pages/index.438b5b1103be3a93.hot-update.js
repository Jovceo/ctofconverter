/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./locales lazy recursive ^\\.\\/.*\\.json$":
/*!*******************************************************!*\
  !*** ./locales/ lazy ^\.\/.*\.json$ namespace object ***!
  \*******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var map = {
	"./en/47-c-to-f.json": [
		"./locales/en/47-c-to-f.json"
	],
	"./en/common.json": [
		"./locales/en/common.json"
	],
	"./en/home.json": [
		"./locales/en/home.json",
		"locales_en_home_json"
	],
	"./es/47-c-to-f.json": [
		"./locales/es/47-c-to-f.json"
	],
	"./es/common.json": [
		"./locales/es/common.json"
	],
	"./hi/47-c-to-f.json": [
		"./locales/hi/47-c-to-f.json"
	],
	"./hi/common.json": [
		"./locales/hi/common.json"
	],
	"./id/47-c-to-f.json": [
		"./locales/id/47-c-to-f.json"
	],
	"./id/common.json": [
		"./locales/id/common.json"
	],
	"./pt-br/47-c-to-f.json": [
		"./locales/pt-br/47-c-to-f.json"
	],
	"./pt-br/common.json": [
		"./locales/pt-br/common.json"
	],
	"./zh/47-c-to-f.json": [
		"./locales/zh/47-c-to-f.json"
	],
	"./zh/common.json": [
		"./locales/zh/common.json"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(function() {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function() {
		return __webpack_require__.t(id, 3 | 16);
	});
}
webpackAsyncContext.keys = function() { return Object.keys(map); };
webpackAsyncContext.id = "./locales lazy recursive ^\\.\\/.*\\.json$";
module.exports = webpackAsyncContext;

/***/ })

});