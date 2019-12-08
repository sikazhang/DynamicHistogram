import * as d3 from '../../src/d3';
import mock from './utils/mockData'
// 父级容器
const container = document.getElementById('inputfile');

// container.onchange = () => {
//     console.log('change');
//     var r = new FileReader();
//     var file = document.getElementById('inputfile').files[0];
//     r.readAsText(file, 'utf-8');
//     r.onload = e => {
//         // 创建动态组件实例
//         console.log(e);
//         const dynamicRank = new Histogram(e.target.result);
//         dynamicRank.start();
//         console.log(container);
//     }
// }

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
class Histogram {
    constructor(document) {
        console.log(d3);
        this.colors = [];
        this.dateList = [];
        this.dateIndex = 0;
        this.currentData = [];
        this.data = mock;
        this.document = document
        // this.data = d3.csvParse(data);
        this.init();
    }
    init() {
        // 定义布局变量
        const margin = {left: 250, right: 150, top: 20, bottom: 0};
        this.innerWidth = DEFAULT_CONFIG.width - margin.left - margin.right;
        this.innerHeight = DEFAULT_CONFIG.height - margin.top - margin.bottom;
        // 画布
        const svg = d3.select('#container')
            .append('svg')
            .attr('width', DEFAULT_CONFIG.width)
            .attr('height', DEFAULT_CONFIG.height);
        this.g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        this.xAxisG = this.g.append('g')
            .attr('transform', `translate(0,${this.innerHeight})`);
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
            .tickSize(-this.innerHeight);
        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickPadding(5)
            .tickSize(-this.innerWidth);
        // 右下角时间指示器
        this.g.append('text')
            .attr('class', 'dateLabel')
            .attr('text-anchor', 'end')
            .attr('transform', `translate(${this.innerWidth - 10},${this.innerHeight - 10})`);
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

        this.currentData.sort((a, b) => {
            return b.value - a.value
        });

    }
    drawHistogram() {
        let xMin = d3.min(this.currentData, this.xValue);
        let xMax = d3.max(this.currentData, this.xValue);
        this.xScale.domain([0, xMax + 1]).range([0, this.innerWidth]);
        this.yScale.domain(this.currentData
            .map(e => e.name)
            .reverse())
            .range([this.innerHeight, 0]);

        this.xAxisG.transition()
            .duration(3000 * DEFAULT_CONFIG.intervalTime)
            .ease(d3.easeLinear)
            .call(this.xAxis);
        this.yAxisG.transition()
            .duration(3000 * DEFAULT_CONFIG.intervalTime)
            .ease(d3.easeLinear)
            .call(this.yAxis);
        this.yAxisG.selectAll('.tick').remove();

        // 选中所有bar并绑定数据（指定key函数）
        let bar = this.g.selectAll('.bar').data(this.currentData, e => e.name);
        
        // enter，起始动画
        let barEnter = bar.enter()
            .append('g')
            .attr('class', 'bar')
            .attr('transform', d => {
                return 'translate(0, ' + this.yScale(this.yValue(d)) + ')';
            });
        // Y轴文字
        barEnter.append('text')
            .attr('x', -10)
            .attr('text-anchor', 'end')
            .attr('class', 'label')
            .style('fill', d => this.colors[d.name])
            .text(d => {
                return this.yValue(d);
            })
            .attr('y', 50)
            .attr('fill-opacity', 0)
            .transition()
            .delay(500*DEFAULT_CONFIG.intervalTime)
            .duration(2490*DEFAULT_CONFIG.intervalTime)
            .attr('y', 18)
            .attr('fill-opacity', 1);

        // 矩形
        barEnter.append('rect')
            .attr('x', 0)
            .attr('y', 50)
            .attr('width', 0)
            .attr('height', DEFAULT_CONFIG.rectHeight)
            .attr('fill-opacity', 0)
            .attr('fill', d=>this.colors[d.name])
            .transition()
            .delay(500 * DEFAULT_CONFIG.intervalTime)
            .duration(2490 * DEFAULT_CONFIG.intervalTime)
            .attr('y', 0)
            .attr('width', d => this.xScale(d.value))
            .attr('fill-opacity', 1);
        // 矩形后的数字
        barEnter.append('text')
            .attr('text-anchor', 'end')
            .attr('x', 10)
            .attr('y', 50)
            .attr('fill-opacity', 0)
            .attr("class","value")
            .text(d => d.value)
            .style('fill', d => this.colors[d.name])
            .transition()
            .duration(2950 * DEFAULT_CONFIG.intervalTime)
            .tween("text_tween", d => {
                let query = this.document.querySelectorAll('.value')
                let arr = Array.from(query);
                let searchIndex;
                arr.map((item, index) => {
                    if (item.__data__.name === d.name) {
                        searchIndex = index
                    }
                });
                this.document.querySelectorAll('.value')[searchIndex].textContent = d.value * 0.8;
                let i=d3.interpolateRound(this.document.querySelectorAll('.value')[searchIndex].textContent, d.value);
                return t => {
                    this.document.querySelectorAll('.value')[searchIndex].textContent = i(t);
                }
            })
            .attr('x', d=> {
                // 根据数字大小计算x坐标（每个数字大概10px）
                let prefix = d.value.split('.');
                let strLength = prefix[0].length;
                return this.xScale(d.value) + strLength * 16;
            })
            .attr('y', 22)
            .attr('fill-opacity', 1);

        // 矩形上的字
        barEnter.append('text')
            .attr('text-anchor', 'end')
            .attr('x', 5)
            .attr('y', 50)
            .attr('class', 'barInfo')
            .attr('fill-opacity', 0)
            .attr('stroke-width', '0px')
            .attr('stroke', d=>this.colors[d.name])
            .text(d => d.name)
            .transition()
            .delay(500 * DEFAULT_CONFIG.intervalTime)
            .duration(2450 * DEFAULT_CONFIG.intervalTime)
            .attr('x', d => this.xScale(this.xValue(d)) - 10)
            .attr('y', 18)
            .attr('stroke-width', '1px')
            .attr('fill-opacity', 1);

        // update（更新动态）,有可能是全新的一套数据，但是bar的位置已经确定，只需要更改颜色和样式即可
        let barUpdate = bar.transition().duration(2950 * DEFAULT_CONFIG.intervalTime).ease(d3.easeLinear);
        barUpdate.select('rect')
            .attr('width', d => this.xScale(d.value))
            .attr('fill', d => this.colors[d.name]);
        barUpdate.select('.label')
            .text(d => d.name)
            .style('fill', d => this.colors[d.name]);
        barUpdate.select('.value')
            .style('fill',d => this.colors[d.name])
            .tween("text_tween", d => {
                let query = this.document.querySelectorAll('.value')
                let arr = Array.from(query);
                let searchIndex;
                arr.map((item, index) => {
                    if (item.__data__.name === d.name) {
                        searchIndex = index
                    }
                });
                this.document.querySelectorAll('.value')[searchIndex].textContent = d.value * 0.8;
                let i=d3.interpolateRound(this.document.querySelectorAll('.value')[searchIndex].textContent, d.value);
                return t => {
                    this.document.querySelectorAll('.value')[searchIndex].textContent = i(t);
                }
            })
            .attr('x', d => {
                // 根据数字大小计算x坐标（每个数字大概10px）
                let prefix = d.value.split('.');
                let strLength = prefix[0].length;
                return this.xScale(d.value) + strLength * 16;
            });
    
        barUpdate.select('.barInfo')
            .style('stroke',d => this.colors[d.name])
            .attr('x',d => this.xScale(this.xValue(d)) - 10);
        
        // 更新dateLabel
        this.g.select('.dateLabel')
            .text(this.dateList[this.dateIndex]);

        // exit,准备删除多余的图形
        let barExit = bar.exit().transition().duration(2500 * DEFAULT_CONFIG.intervalTime);
        barExit.attr('transform','translate(0,${innerHeight+50})')
            .attr('fill-opacity', 0)
            .remove();
    }
    changeHistogram() {
        this.g.selectAll('.bar')
            .transition()
            .ease(d3.easeLinear)
            .duration(3000 * DEFAULT_CONFIG.intervalTime)
            .attr('transform', d => {
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

        return;
    }
    show() {
        const self = this;
        let setStart = () => {
            self.start();
            setTimeout(setStart, 3000);
        }
        setTimeout(setStart, 3000);
    }
    xValue(e) {
        return +e.value;
    }
    yValue(e) {
        return e.name;
    }
}

const dynamicRank = new Histogram(document);
dynamicRank.show()
// dynamicRank.start();



