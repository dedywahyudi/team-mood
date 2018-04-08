import { Component, ViewChild, ElementRef, Input } from '@angular/core';

import * as d3 from 'd3';
import { flattenDeep } from 'lodash';
import { animationDuration } from '../../config';
import { wrapText, expand, eq, _day, DAY } from '../../util';

/**
 * LineChartComponent - render a line chart
 */

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.html'
})
export class LineChartComponent {
  @ViewChild('chartEl') chartEl: ElementRef;
  @ViewChild('tooltipEl') tooltipEl: ElementRef;

  /**
   * items The data items to render
   * @type {Array<any>}
   */
  @Input() items = [];

  /**
   * interval The date interval for which to render the graph
   * @type {[start: Date, end: Date]}
   */
  @Input() interval;

  /**
   * bands The labels for each graph
   * @type {Array<string>}
   */
  @Input() bands = [];

  // graph's margins
  private margins = {top: 20, right: 0, bottom: 50, left: 11};

  // helper element to listen for mouse events over graph
  private hitarea;
  // main graph element
  private svg;
  // graph configs
  private width;
  private height;

  // graph scales
  private xScale;
  private yScale;

  // graph axis
  private xAxis;

  // the data that the tooltip will render
  public tooltipData;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    // render the base element
    this.render();

    this.update();
  }

  ngOnChanges({ items }) {
    // On changes, if items input changed, update the graph
    if (items && !items.firstChange) {
      this.update();
    }
  }

  /**
   * render Create the base svg element & the needed axis
   */
  render() {
    const { offsetWidth, offsetHeight } = this.el.nativeElement;
    this.width = offsetWidth - this.margins.left - this.margins.right;
    this.height = offsetHeight - this.margins.top - this.margins.bottom;

    // append the main svg element, and config it
    this.svg = d3.select(this.chartEl.nativeElement)
      .append('svg')
        .attr('width', offsetWidth)
        .attr('height', offsetHeight)
      .append('g')
        .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`);

    // create the x & y scales and set the domains for them
    this.xScale = d3.scaleTime().rangeRound([70, this.width - 30]);
    this.yScale = d3.scaleBand().rangeRound([this.height, 0]).padding(0);

    // create the main x-axis
    this.xAxis = this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${this.height})`);

    // create an element to cover the graph, so we can listen for mouse events on it
    this.hitarea = this.svg.append('svg:rect')
      .attr('class', 'hitzone')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('transform', `translate(70, 0)`);

    // add the mouse event listener on the hitarea
    this.hitarea
      .on('touchstart', this.onTouchstart.bind(this));
  }

  update() {
    if (!this.svg) {
      return;
    }

    // flatten the items, and categorize them by mood
    let items = flattenDeep(this.items).reduce((p, c) => (p[c.mood] = (p[c.mood] || []).concat(c), p), {});
    items = [...this.bands].reverse().map(mood => ({mood, items: items[mood] || []}));

    const max = Math.max(...flattenDeep(items.map(i => i.items.map(({ count }) => count))));

    // update the x & y domains
    this.xScale.domain(this.interval).nice();
    this.yScale.domain(this.bands);

    // draw the graph's x axis
    this.xAxis.call(d3.axisBottom(this.xScale)
        .ticks(5)
        .tickFormat(d3.timeFormat('%-m/%-d'))
        .tickSize(-this.height));

    this.xAxis.selectAll('line')
      .attr('data-d', d => `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`);

    // save the width of each vertical graph
    const bandWidth = this.yScale.bandwidth();

    // append a 'g' for each mood graph, and position on stacked on eachother
    const graphs = this.svg.selectAll('.graph')
      .data(items.concat(void 0).reverse())
      .enter().insert('g', '.hitzone')
        .attr('class', 'graph')
        .attr('transform', (d, i, {length}) => `translate(0, ${(length - i - 1) * bandWidth})`);

    // attach the horizontal gridlines
    graphs.append('line')
      .attr('class', 'gridline')
      .attr('x2', this.width);

    // append the graph line
    graphs.append('path')
      .attr('class', 'line')
      .attr('data-mood', ({ mood = '' } = {}) => mood);

    // append the area under the graph line
    graphs.append('path')
      .attr('class', 'area')
      .attr('data-mood', ({ mood = '' } = {}) => mood);

    // append the graph label
    graphs.append('text')
      .attr('class', 'label')
      .text(({ mood = '' } = {}) => mood)
      .call(wrapText, 60);

    const this$ = this;
    // create an array which contains each day in the passed interval
    const xTicks = expand(this.interval);

    // create intersection (with the x-axis' ticks) dots for the chart's graphics
    graphs.selectAll('.dot')
      .data(xTicks)
      .enter()
        .append('circle')
        .attr('fill', 'none')
        .style('opacity', 0)
        .attr('class', 'dot')
        .attr('transform', 'translate(0, 0)')
        .attr('r', 3);

    // render each mood graph's data
    this.svg.selectAll('.graph')
      .each(function(data) {
        if (!data) { return; }

        const g = d3.select(this);
        // create a y scale specific to this mood graph
        // and set it's domain
        const yScale = d3.scaleLinear().range([bandWidth, 1]);
        yScale.domain([0, max]);

        /**
         * find function to get the value based on a passed date
         * @param {Date} d
         */
        const value = d => (data.items.find(i => eq(i.date, d)) || {}).count || 0;

        // define the function to draw the graph line
        const line = () => d3.line()
          .x(d => this$.xScale(_day(d)))
          .y(d => yScale(value(d)));

        // define the function to draw the area under the graph line
        const area = () => d3.area()
            .x(d => this$.xScale(_day(d)))
            .y0(yScale(0))
            .y1(d => yScale(value(d)));

        // update the graph line & animate it
        const linePath = g.select('.line');
        linePath.attr('d', linePath.attr('d') || line().y(yScale(0))(xTicks))
          .transition()
            .duration(animationDuration)
            .attr('d', line()(xTicks));

        // update the area under the graph line & animate it
        const areaPath = g.select('.area');
        areaPath.attr('d', areaPath.attr('d') || area().y1(yScale(0))(xTicks))
          .transition()
            .duration(animationDuration)
            .attr('d', area()(xTicks));

        // update the chart intersection dots' positions
        g.selectAll('.dot')
          .data(xTicks)
          .attr('data-d', (d, i) => `${xTicks[i].getDate()}-${xTicks[i].getMonth()}-${xTicks[i].getFullYear()}`)
          .attr('data-mood', data.mood)
          .attr('cx', d => this$.xScale(d))
          .attr('cy', d => yScale(value(d)));
      });
  }

  /**
   * onTouchstart When user starts dragging mouse over chart,
   * add listeners for drag & drag end
   */
  onTouchstart() {
    this.hitarea
      .on('touchmove', this.onTouchmove.bind(this))
      .on('touchend', this.onTouchend.bind(this));

    this.removeDocumentListeners();
    this.onTouchmove();
  }

  /**
   * onTouchmove Check if user is hovering a specific date
   * If so, mark that date as selected and show a tooltip for it
   */
  onTouchmove() {
    // get the x coordinate from current mouse position
    const [x] = d3.mouse(this.svg.node());

    // get the closest date to the mouse position
    const date = this.xScale.invert(x);
    const day = _day(date);

    const diff = Math.ceil((date - day) / (3600 * 1000 /* 1 hour */));

    // if mouse is close to a day's 4am, select it
    if (diff <= 4) {
      return this.select(day, x);
    }

    // if mouse is close to a day's 20pm, select the next day
    // (it means it's closer to the next day, than it is to current one)
    if (diff >= 20) {
      return this.select(day + DAY, x)
    }

    this.deselect();
  }

  /**
   * onTouchend Remove the move/drag listener
   */
  onTouchend() {
    this.hitarea
      .on('touchmove', null)
      .on('touchend', null);
  }

  /**
   * select Add data for chart tooltip
   * @param {Date}   date The date that was selected
   * @param {number} x The x coordinate for the tooltip
   */
  select(date, x) {
    if (this.tooltipData && eq(this.tooltipData.date, date)) {
      return;
    }

    // create the tooltip data object
    this.tooltipData = {date, items: {}, x, bands: [...this.bands]};

    // create the itmes array for the tooltip
    flattenDeep(this.items).filter(i => eq(i.date, date))
      .forEach(i => this.tooltipData.items[i.mood] = i.count);

    this.hideDots();

    // show the intersection dots for the selected date
    const d = new Date(date);
    const selector = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
    this.svg.selectAll(`.dot[data-d="${selector}"]`)
      .style('opacity', 1);

    this.svg.selectAll(`line[data-d="${selector}"]`)
      .attr('class', 'highlight');

    this.removeDocumentListeners();
    // exit current event loop and
    // start listening for document clicks to hide the tooltip
    setTimeout(() =>
      document.addEventListener('click', this.deselect, false), 150);

    // render the tooltip, then reposition it
    setTimeout(this.positionTooltip.bind(this, x));
  }

  /**
   * deselect Deselect the data for tooltip
   */
  deselect = () => {
    this.tooltipData = null;
    this.hideDots();

    this.removeDocumentListeners();
  }

  /**
   * hideDots Hide the chart intersection dots
   */
  hideDots() {
    this.svg.selectAll('.dot')
      .style('opacity', 0);

    // remove tick line highlight
    this.svg.selectAll(`line[data-d]`)
      .attr('class', '');
  }

  /**
   * removeDocumentListeners Remove the click listener on document
   */
  removeDocumentListeners() {
    document.removeEventListener('click', this.deselect);
  }

  /**
   * positionTooltip Check if tooltip is entirely visible, otherwise reposition it
   * @param {number} x The x coordinate of the tooltip
   */
  positionTooltip(x) {
    if (!this.tooltipEl.nativeElement.firstElementChild) {
      return;
    }

    const { offsetWidth } = this.tooltipEl.nativeElement.firstElementChild;

    // tooltip's max right coordinate is window's width
    const maxRight = window.innerWidth;
    // get tooltip's current left & right positioning
    const [left, right] = [x - offsetWidth/2, x + offsetWidth/2];

    // correct left position
    if (left < 0) {
      x -= left;
    }

    // correct the right position
    if (right > maxRight) {
      x -= right - maxRight;
    }

    return this.tooltipData = {...this.tooltipData, x};
  }
}
