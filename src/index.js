/**
 * @file 动态柱状图实现
 * @author sikazhang
 * @date 2019-12-07
 */

import d3 from 'd3.js';
// 支持自定义配置项
const DEFAULT_CONFIG = {

};

/**
 * 柱状图组件
 * @param {object} config
 */
export default class Histogram {
    constructor() {
        this.drawHistogram();
    }

    drawHistogram() {
        console.log('draw the histogram');
    }
}

