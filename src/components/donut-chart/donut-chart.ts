import * as d3 from 'd3';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';

import { animationDuration } from '../../config';
import { arcTween } from '../../util';

const TAU = Math.PI * 2;

/**
 * DonutChartComponent - render a donut chart
 */

@Component({
  selector: 'donut-chart',
  templateUrl: 'donut-chart.html'
})
export class DonutChartComponent {
  @ViewChild('chartEl') chartEl: ElementRef;

  /**
   * border The width of the arc
   * @type {number}
   */
  @Input() border = 10;

  /**
   * border The maximum value for the chart
   * @type {number}
   */
  @Input() total = 0;

  /**
   * border The data items to render
   * @type {number}
   */
  @Input() items = [];

  /**
   * border If graph should animate or not
   * @type {boolean}
   */
  @Input() anim = false;

  // arc function, constructed based on passed chart data
  private arcFn;
  // the chart's main track element
  private track;
  // the chart's arc elements
  private arcs = [];

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    // render the base elements for the graph
    this.render();
  }

  ngOnChanges({ items }) {
    if (items && !items.firstChange) {
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
    const svg = d3.select(this.chartEl.nativeElement)
      .append('svg')
        .attr('width', offsetWidth)
        .attr('height', offsetHeight)
      .append('g')
        .attr('transform', `translate(${offsetWidth/2}, ${offsetHeight/2})`);

    // arc function to draw the chart's arcs
    this.arcFn = (start = 0) => d3.arc()
      .outerRadius(radius)
      .innerRadius(radius - this.border)
      .cornerRadius(this.border)
      .startAngle(start);

    // create the chart's main track path (the placeholder tack)
    this.track = svg.append('path')
      .attr('d', this.arcFn().endAngle(TAU))
      .attr('class', 'track');

    // create chart's arcs
    this.items.forEach(item => {
      const arcPath = svg.append('path')
        .attr('class', 'progress')
        .attr('data-mood', item.mood);

      this.arcs.push(arcPath);
    });

    this.update();
  }

  /**
   * update Update (re-render) the graph data based on latest input
   */
  update() {
    this.track.attr('d', this.arcFn().endAngle(TAU));

    // update each item's arc path (start from last path's end)
    this.items.reduce((sum, item, i) => {
      const start = (sum / this.total) * TAU || 0;
      let end = ((item.count + sum) / this.total) * TAU || 0;

      // if it's not the last item, elongate the arc's end to cover the empty space
      if(i !== this.items.length - 1) {
        end *= 1.1;
      }

      // last data of current arc
      const datum = (this.anim !== false ? this.arcs[i].datum() : null) || {};

      // update arc's sizes & animate it
      this.arcs[i]
        .datum({start, end})
        .attr('d', this.arcFn(start).endAngle(start))
        .attr('data-mood', item.mood)
        .transition()
          .duration(animationDuration)
          .attrTween("d", arcTween(this.arcFn(start), {start: datum.end || start, end}));

      return sum + item.count;
    }, 0);
  }
}
