"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _d = _interopRequireDefault(require("d3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// 支持自定义配置项
var DEFAULT_CONFIG = {};
/**
 * 柱状图组件
 * @param {object} config
 */

var Histogram =
/*#__PURE__*/
function () {
  function Histogram() {
    _classCallCheck(this, Histogram);

    this.drawHistogram();
  }

  _createClass(Histogram, [{
    key: "drawHistogram",
    value: function drawHistogram() {
      console.log('draw the histogram');
    }
  }]);

  return Histogram;
}();

exports.default = Histogram;
//# sourceMappingURL=index.js.map