/**
 * Utility functions used to reduce code redundancy
 */

import * as d3 from 'd3';

import { range } from 'lodash';

// save the value for a whole day in milliseconds
export const DAY = 24 * 3600 * 1000;

/**
 * _day convert a date in a day-only value (no hours information)
 * @param {Date} date The date to be converted
 *
 * @returns {number}
 */
export const _day = date => new Date(date).setHours(0, 0, 0, 0);

/**
 * expand Create an interval of days as Date objects
 * @param {Array<number>} Start and end of the interval
 *
 * @returns {Array<Date>}
 */
export const expand = ([start, end]) => (
  range((end - start) / DAY + 1).map(i => new Date(end - i * DAY)));

/**
 * eq Checks if 2 dates are the same (check only the day, not hours/minutes)
 * @param {<date|string|number>} date1
 * @param {<date|string|number>} date2
 *
 * @returns {boolean}
 */
export const eq = (date1, date2) => _day(date1) === _day(date2);

/**
 * wrapText Wrap a svg text element
 *
 * @type {Function}
 * @param {svgElement} text
 * @param {number} width The width to wich to wrap the text
 */
export const wrapText = (text, width) => {
  text.each(function() {
    const text = d3.select(this),
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")) || 0,
      lineHeight = 1.1, // ems
      words = text.text().trim().split(' ').reverse();

    if (words.length <= 1) {
      return;
    }

    let word,
      line = [],
      lineNumber = 0,
      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
};

/**
 * arcTween Tween function for a svg arc element
 * @type {Function}
 * @param {svgElement} arc
 * @param {any} The Start and end of the arc
 */
export const arcTween = (arc, {end = 0, start = 0}) => () => {
  const interpolate = d3.interpolate(start, end);

  return t => arc.endAngle(interpolate(t))();
};
