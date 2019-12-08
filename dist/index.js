"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.array.sort.js");

require("core-js/modules/es6.function.name.js");

var _mock = _interopRequireDefault(require("./mock.csv"));

var _d = _interopRequireDefault(require("d3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// 支持自定义配置项
var DEFAULT_CONFIG = {
  width: 1800,
  height: 800,
  rectHeight: 26,
  intervalTime: 0.5,
  baseColors: ['#FFB6C1', '#2EA9DF', '#C71585', '#FFC012', '#7B68EE', '#0000CD', '#000080', '#87CEFA', '#DC143C', '#39C5BB', '#009714', '#FFD700', '#FFA500', '#FF8C00']
};
/**
 * 柱状图组件
 * @param {object} config
 */

var Histogram =
/*#__PURE__*/
function () {
  function Histogram() {
    _classCallCheck(this, Histogram);

    this.colors = [];
    this.dataList = [];
    this.dateIndex = 0;
    this.currentData = [];
    this.data = _d.default.csvParse(_mock.default);
    this.init();
    this.start();
  }

  _createClass(Histogram, [{
    key: "init",
    value: function init() {
      // 定义布局变量
      var margin = {
        left: 250,
        right: 150,
        top: 20,
        bottom: 0
      };
      var innerWidth = DEFAULT_CONFIG.width - margin.left - margin.right;
      var innerHeight = DEFAULT_CONFIG.height - margin.top - margin.bottom; // 画布

      var svg = _d.default.select('#container').append('svg').attr('width', DEFAULT_CONFIG.width).attr('height', DEFAULT_CONFIG.height);

      this.g = svg.append('g').attr('transform', "translate(".concat(margin.left, ", ").concat(margin.top, ")"));
      this.xAxisG = this.g.append('g').attr('transform', "translate(0,".concat(innerHeight, ")"));
      this.yAxisG = this.g.append('g'); // 比例尺

      this.xScale = _d.default.scaleLinear();
      this.yScale = _d.default.scaleBand().paddingInner(0.3).paddingOuter(0); // 轴

      this.xAxis = _d.default.axisBottom().scale(this.xScale).ticks(10).tickPadding(20).tickFormat(function (d) {
        return d < 0 ? '' : d;
      }).tickSize(-innerHeight);
      this.yAxis = _d.default.axisLeft().scale(this.yScale).tickPadding(5).tickSize(-innerWidth); // 右下角时间指示器

      this.g.append('text').attr('class', 'dateLabel').attr('text-anchor', 'end').attr('transform', "translate(".concat(innerWidth - 10, ",").concat(innerHeight - 10, ")"));
      this.initColorAndDate();
    }
  }, {
    key: "initColorAndDate",
    value: function initColorAndDate() {
      var _this = this;

      var index = 0;
      this.data.forEach(function (item) {
        if (_this.dateList.indexOf(item.date) === -1) {
          _this.dateList.push(item.date);
        }

        if (_this.colors[item.name] === undefined) {
          _this.colors[item.name] = DEFAULT_CONFIG.baseColors[index % DEFAULT_CONFIG.baseColors.length];
          index++;
        }
      });
    }
  }, {
    key: "getCurrentData",
    value: function getCurrentData(date) {
      var _this2 = this;

      this.currentData = [];
      this.data.forEach(function (item) {
        if (item.date === date && +item.value > 0) {
          _this2.currentData.push(item);
        }
      });
      this.currentData.sort();
    }
  }, {
    key: "drawHistogram",
    value: function drawHistogram() {
      var _this3 = this;

      var xMin = _d.default.min(this.currentData, this.xValue);

      var xMax = _d.default.max(this.currentData, this.xValue);

      this.xScale.domain([0, xMax + 1]).range([0, innerWidth]);
      this.yScale.domain(this.currentData.map(function (e) {
        return e.name;
      }).reverse().range([innerHeight, 0]));
      this.xAxisG.transition().duration(3000 * DEFAULT_CONFIG.interval_time).ease(_d.default.easeLinear).call(this.xAxis);
      this.yAxisG.transition().duration(3000 * DEFAULT_CONFIG.interval_time).ease(_d.default.easeLinear).call(this.yAxis);
      this.yAxisG.selectAll('.tick').remove(); // 选中所有bar并绑定数据（指定key函数）

      var bar = this.g.selectAll('.bar').data(this.currentData, function (e) {
        return e.name;
      }); // enter，起始动画

      var barEnter = bar.enter().append('g').attr('class', 'bar').attr('transform', function (d) {
        return 'translate(0, ' + this.yScale(this.yValue(d)) + ')';
      }); // 矩形

      barEnter.append('rect').attr('x', 0).attr('y', 50).attr('width', 0).attr('height', DEFAULT_CONFIG.rectHeight).attr('fill-opacity', 0).attr('fill', function (d) {
        return _this3.colors[d.name];
      }).transition().delay(500 * DEFAULT_CONFIG.interval_time).duration(2490 * DEFAULT_CONFIG.interval_time).attr('y', 0).attr('width', function (d) {
        return _this3.xScale(d.value);
      }).attr('fill-opacity', 1); // update（更新动态）,有可能是全新的一套数据，但是bar的位置已经确定，只需要更改颜色和样式即可

      var barUpdate = bar.transition().duration(2950 * DEFAULT_CONFIG.interval_time).ease(_d.default.easeLinear);
      barUpdate.select('rect').attr('width', function (d) {
        return _this3.xScale(d.value);
      }).attr('fill', function (d) {
        return _this3.colors[d.name];
      });
    }
  }, {
    key: "changeHistogram",
    value: function changeHistogram() {
      this.g.selectAll('.bar').transition().ease(_d.default.easeLinear).duration(3000 * DEFAULT_CONFIG.intervalTime).attr('transform', function (d) {
        return 'translate(0,' + this.yScale(this.yValue(d)) + ')';
      });
    }
  }, {
    key: "start",
    value: function start() {
      if (this.dateIndex < this.dateList.length) {
        this.getCurrentData(this.dateList[this.dateIndex]);
        this.drawHistogram();
        this.changeHistogram();
        this.dateIndex++;
      }
    }
  }, {
    key: "xValue",
    value: function xValue(e) {
      return +e.value;
    }
  }, {
    key: "yValue",
    value: function yValue(e) {
      return e.name;
    }
  }]);

  return Histogram;
}();

exports.default = Histogram;
//# sourceMappingURL=index.js.map