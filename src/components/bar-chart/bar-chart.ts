import { Component, ViewChild, ElementRef, Input } from '@angular/core';

import * as d3 from 'd3';
import { flattenDeep } from 'lodash';

import { animationDuration } from '../../config';
import { wrapText } from '../../util';

/**
 * BarChart component - render a chart with bars
 */

@Component({
  selector: 'bar-chart',
  templateUrl: 'bar-chart.html'
})
export class BarChartComponent {
  @ViewChild('chartEl') chartEl: ElementRef;

  /**
   * items The input items for the chart
   * @type {Array<any>}
   */
  @Input() items = [];

  /**
   * bands The bar types
   * @type {Array<string>}
   */
  @Input() bands = [];

  // chart margins within the svg element
  private margins = {top: 20, right: 0, bottom: 50, left: 30};

  // the created svg element
  private svg;
  // x and y scales for the chart
  private xScale;
  private yScale;

  // function to update the chart axis on data update
  private updateAxis;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    // render the base elements for the graph
    this.render();

    // update the graph with the data elements
    this.update();
  }

  ngOnChanges({ items }) {
    if (items) {
    // update the graph with the data elements
      this.update();
    }
  }

  /**
   * render Create and attach the base elements for the graph
   */
  render() {
    const { offsetWidth, offsetHeight } = this.el.nativeElement;
    const width = offsetWidth - this.margins.left - this.margins.right;
    const height = offsetHeight - this.margins.top - this.margins.bottom;

    // append the main svg element, and config it
    this.svg = d3.select(this.chartEl.nativeElement)
      .append('svg')
        .attr('width', offsetWidth)
        .attr('height', offsetHeight)
      .append('g')
        .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`);

    // create the x and y scales, set their domains
    // x scale is a band scale
    this.xScale = d3.scaleBand().rangeRound([0, width]).padding(0);
    this.yScale = d3.scaleLinear().rangeRound([height, 0]);

    // create the graph's axis
    const xAxis = this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`);

    const yAxis = this.svg.append('g')
      .attr('class', 'axis axis--y');

    // create and store the update axis function
    this.updateAxis = () => {
      // update the x axis ticks & band widths
      xAxis.call(d3.axisBottom(this.xScale))
        .selectAll(".tick text")
          .call(wrapText, this.xScale.bandwidth() - 15);

      // update the y axis ticks
      yAxis.call(d3.axisLeft(this.yScale)
        .ticks(4)
        .tickFormat(d3.format('d'))
        .tickSize(-width));
    };
  }

  /**
   * update Re-render the chart's data elements (the bars)
   */
  update() {
    if (!this.svg) {
      return;
    }

    const { offsetHeight } = this.el.nativeElement;
    const height = offsetHeight - this.margins.top - this.margins.bottom;

    // we can have multiple sets of data, flatten the data sets
    let items = flattenDeep(this.items).reduce((p, c) => (p[c.mood] = (p[c.mood] || 0) + c.count, p), {});
    items = [...this.bands.reverse()].map(mood => ({mood, count: items[mood] || 0})).reverse();

    // if no data was provided, try to use last set of data,
    // but with all values set to 0
    const bars = this.svg.selectAll('.bar');
    items = items.length ? items : bars.data().map(d => ({...d, count: 0}));

    // set the domains for the x and y axis, and update (re-render) them
    this.xScale.domain(items.map(d => d.mood));
    this.yScale.domain([0, Math.max(5, d3.max(items, d => d.count))]);
    this.updateAxis();

    // create bars for each data item
    bars.data(items)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('data-mood', d => d.mood);

    const _this = this;
    const bandWidth = this.xScale.bandwidth();

    // update each bar with the it's corresponding item value
    this.svg.selectAll('.bar')
      .each(function(d) {
        const el = d3.select(this);
        el.attr('x', _this.xScale(d.mood))
          .attr('width', 15)
          .attr('transform', `translate(${(bandWidth - 15)/2}, 0)`)

          // animate the bar heights,
          // set initial value to 0 or last bar height value
          .attr('y', el.attr('y') || height)
          .attr('height', el.attr('height') || 0)
            .transition().duration(animationDuration)
            .attr('y', _this.yScale(d.count || 0))
            .attr('height', height - _this.yScale(d.count || 0) + 1); //+1 to overlap the x axis
      });
  }
}
