import * as d3 from 'd3';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';

import { animationDuration } from '../../config';
import { arcTween } from '../../util';

// tau is normaly 2*PI, where a complete circle ends,
// but we need 1.5*PI, because that's where our graph's end is
const TAU = Math.PI * 1.5;

/**
 * ProfileChartComponent - render a radial progress chart
 */

@Component({
  selector: 'profile-chart',
  templateUrl: 'profile-chart.html'
})
export class ProfileChartComponent {
  @ViewChild('chartEl') chartEl: ElementRef;

  /**
   * border The width of the arc
   * @type {number}
   */
  @Input() border = 9;

  /**
   * items The padding between the arcs
   * @type {number}
   */
  @Input() padding = 7;

  /**
   * items The input items for the chart
   * @type {Array<any>}
   */
  @Input() items = [];

  /**
   * items The arcs to be rendered
   * @type {Array<string>}
   */
  @Input() tracks = [];

  // main graph element
  private svg;

  // arc function, constructed based on passed chart data
  private arcFn;

  // legend element's size (the smallest arc - padding)
  public legendWidth = 0;

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
   * render Create the base svg element & the needed axis
   */
  render() {
    const { offsetWidth, offsetHeight } = this.el.nativeElement;
    const radius = Math.min(offsetWidth, offsetHeight) / 2;

    // append the main svg element, and config it
    this.svg = d3.select(this.chartEl.nativeElement)
      .append('svg')
        .attr('width', offsetWidth)
        .attr('height', offsetHeight)
      .append('g')
        .attr('transform', `translate(${offsetWidth/2}, ${offsetHeight/2})`);

    // arc function to draw the chart's arcs
    this.arcFn = (i) => {
      const outerRadius = radius - i * (this.border + this.padding);

      return d3.arc()
      .outerRadius(outerRadius)
      .innerRadius(outerRadius - this.border)
      .cornerRadius(this.border)
      .startAngle(0);
    };

    // append the default/placeholder "tracks"
    this.svg.selectAll('.track')
      .data(this.tracks)
      .enter()
        .append('path')
        .attr('class', 'track')
        .attr('d', (d, i) => this.arcFn(i).endAngle(TAU)());

    // append the chart's tick texts (the numbers that will say the graph's current value)
    this.svg.selectAll('.tick')
      .data(this.tracks)
      .enter()
        .append('text')
        .attr('class', 'tick')
        .text('0')
        .attr('transform', (d, i) => {
          const arc = this.arcFn(i).endAngle(0);
          const [x, y] = arc.centroid();
          return `translate(${x - 10}, ${y + 1})`;
        });

    // calculate the legend's element size
    this.legendWidth = (radius - this.tracks.length * (this.border + this.padding) - 2) * 2;

    // create & append the chart's elements for current values (the progress bars)
    this.svg.selectAll('.progress')
      .data(this.tracks)
      .enter()
        .append('path')
        .attr('class', 'progress')
        .attr('data-mood', d => d)
        .attr('d', (d, i) => this.arcFn(i).endAngle(0)());
  }

  /**
   * update Update (re-render) the graph data based on latest input
   */
  update() {
    if (!this.svg || !this.items) {
      return;
    }

    // categorize the items by mood & count them to render the count value
    let items = this.items.reduce((p, c) => (p[c.mood] = (p[c.mood] || []).concat(c), p), {});
    items = this.tracks.map(mood => ({mood, count: (items[mood] || []).length}));

    // calculate the maximum count value
    const max = Math.max(...items.map(({ count }) => count), 1);

    // starting point of the graphs
    const start = 0;

    // update graph's size (value) & animate it
    this.svg.selectAll('.progress')
      .transition()
        .duration(animationDuration)
        .attrTween('d', (d, i) => arcTween(this.arcFn(i), {start, end: (items[i].count/max) * TAU})());

    // update the ticks' values
    this.svg.selectAll('.tick')
      .text((d, i) => items[i].count);
  }
}
