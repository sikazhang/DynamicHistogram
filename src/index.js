/**
 * @file 动态柱状图实现
 * @author sikazhang
 * @date 2019-12-07
 */
import d3 from './d3';
// 支持自定义配置项
const DEFAULT_CONFIG = {
    width: 1800,
    height: 800,
    rectHeight: 26,
    intervalTime: 0.5,
    baseColors: [
        '#FFB6C1', '#2EA9DF', '#C71585', '#FFC012', '#7B68EE', '#0000CD', '#000080',
        '#87CEFA', '#DC143C', '#39C5BB', '#009714', '#FFD700', '#FFA500', '#FF8C00'
    ]
};

/**
 * 柱状图组件
 * @param {object} config
 */
export default class Histogram {
    constructor(data) {
        console.log(d3.csvParse);
        this.colors = [];
        this.dataList = [];
        this.dataIndex = 0;
        this.currentData = [];
        this.data = d3.csvParse(data);
        this.init();
    }
    init() {
        // 定义布局变量
        const margin = {left: 250, right: 150, top: 20, bottom: 0};
        const innerWidth = DEFAULT_CONFIG.width - margin.left - margin.right;
        const innerHeight = DEFAULT_CONFIG.height - margin.top - margin.bottom;
        // 画布
        const svg = d3.select('#container')
            .append('svg')
            .attr('width', DEFAULT_CONFIG.width)
            .attr('height', DEFAULT_CONFIG.height);
        this.g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        this.xAxisG = this.g.append('g')
            .attr('transform', `translate(0,${innerHeight})`);
        this.yAxisG = this.g.append('g');
        // 比例尺
        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleBand().paddingInner(0.3).paddingOuter(0);
        // 轴
        this.xAxis = d3.axisBottom()
            .scale(this.xScale)
            .ticks(10)
            .tickPadding(20)
            .tickFormat(d=>{
                return d < 0 ? '' : d;
            })
            .tickSize(-innerHeight);
        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickPadding(5)
            .tickSize(-innerWidth);
        // 右下角时间指示器
        this.g.append('text')
            .attr('class', 'dateLabel')
            .attr('text-anchor', 'end')
            .attr('transform', `translate(${innerWidth - 10},${innerHeight - 10})`);
        this.initColorAndDate();
    }
    initColorAndDate() {
        let index = 0;
        this.data.forEach(item => {
            if (this.dateList.indexOf(item.date) === -1) {
                this.dateList.push(item.date);
            }

            if (this.colors[item.name] === undefined) {
                this.colors[item.name] = DEFAULT_CONFIG.baseColors[index % DEFAULT_CONFIG.baseColors.length];
                index++;
            }
        });
    }
    getCurrentData(date) {
        this.currentData = [];
        this.data.forEach(item => {
            if (item.date === date && +item.value > 0) {
                this.currentData.push(item);
            }
        });

        this.currentData.sort();

    }
    drawHistogram() {
        let xMin = d3.min(this.currentData, this.xValue);
        let xMax = d3.max(this.currentData, this.xValue);
        this.xScale.domain([0, xMax + 1]).range([0, innerWidth]);
        this.yScale.domain(this.currentData
            .map(e => e.name)
            .reverse()
            .range([innerHeight, 0]));

        this.xAxisG.transition()
            .duration(3000 * DEFAULT_CONFIG.interval_time)
            .ease(d3.easeLinear)
            .call(this.xAxis);
        this.yAxisG.transition()
            .duration(3000 * DEFAULT_CONFIG.interval_time)
            .ease(d3.easeLinear)
            .call(this.yAxis);
        this.yAxisG.selectAll('.tick').remove();

        // 选中所有bar并绑定数据（指定key函数）
        let bar = this.g.selectAll('.bar').data(this.currentData, e => e.name);
        // enter，起始动画
        let barEnter = bar.enter()
            .append('g')
            .attr('class', 'bar')
            .attr('transform', function (d) {
                return 'translate(0, ' + this.yScale(this.yValue(d)) + ')';
            });
        // 矩形
        barEnter.append('rect')
            .attr('x', 0)
            .attr('y', 50)
            .attr('width', 0)
            .attr('height', DEFAULT_CONFIG.rectHeight)
            .attr('fill-opacity', 0)
            .attr('fill', d=>this.colors[d.name])
            .transition()
            .delay(500 * DEFAULT_CONFIG.interval_time)
            .duration(2490 * DEFAULT_CONFIG.interval_time)
            .attr('y', 0)
            .attr('width', d => this.xScale(d.value))
            .attr('fill-opacity', 1);
        // update（更新动态）,有可能是全新的一套数据，但是bar的位置已经确定，只需要更改颜色和样式即可
        let barUpdate = bar.transition().duration(2950 * DEFAULT_CONFIG.interval_time).ease(d3.easeLinear);
        barUpdate.select('rect')
            .attr('width', d => this.xScale(d.value))
            .attr('fill', d => this.colors[d.name]);
    }
    changeHistogram() {
        this.g.selectAll('.bar')
            .transition()
            .ease(d3.easeLinear)
            .duration(3000 * DEFAULT_CONFIG.intervalTime)
            .attr('transform', function (d) {
                return 'translate(0,' + this.yScale(this.yValue(d)) + ')';
            });
    }
    start() {
        if (this.dateIndex < this.dateList.length) {
            this.getCurrentData(this.dateList[this.dateIndex]);
            this.drawHistogram();
            this.changeHistogram();
            this.dateIndex++;
        }
    }
    xValue(e) {
        return +e.value;
    }
    yValue(e) {
        return e.name;
    }
}

