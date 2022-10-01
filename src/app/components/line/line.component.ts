import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

interface LineChartOptions {
  xValueName: string;
  yValueName: string;
  x: any;
  y: any;
  yLabel: string; // a label for the y-axis
  title?: (item?: any, index?: any, data?: any) => any; // given d in data, returns the title text
  defined?: any; // for gaps in data
  curve?: any; // method of interpolation between points
  marginTop: number; // top margin, in pixels
  marginRight: number; // right margin, in pixels
  marginBottom: number; // bottom margin, in pixels
  marginLeft: number; // left margin, in pixels
  width: number; // outer width, in pixels
  height: number; // outer height, in pixels
  xType?: any; // type of x-scale
  xDomain?: any; // [xmin, xmax]
  xRange?: any; // [left, right]
  yType?: any; // type of y-scale
  yDomain?: any; // [ymin, ymax]
  yRange?: any; // [bottom, top]
  color: string; // stroke color of line
  strokeWidth: number; // stroke width of line, in pixels
  strokeLinejoin: string; // stroke line join of line
  strokeLinecap: string; // stroke line cap of line
  yFormat?: any; // a format specifier string for the y-axis 
}

const dataForChart = [
  { date: '2007 - 04 - 23', close: 93.24 },
  { date: '2007 - 04 - 24', close: 95.35 },
  { date: '2007 - 04 - 25', close: 98.84 },
  { date: '2007 - 04 - 26', close: 99.92 },
  { date: '2007 - 04 - 29', close: 99.8 },
  { date: '2007 - 05 - 01', close: 99.47 },
  { date: '2007 - 05 - 02', close: 100.39 },
  { date: '2007 - 05 - 03', close: 100.4 },
  { date: '2007 - 05 - 04', close: 100.81 },
  { date: '2007 - 05 - 07', close: 103.92 },
  { date: '2007 - 05 - 08', close: 105.06 },
  { date: '2007 - 05 - 09', close: 106.88 },
  { date: '2007 - 05 - 09', close: 107.34 },
  { date: '2007 - 05 - 10', close: 108.74 },
  { date: '2007 - 05 - 13', close: 109.36 },
  { date: '2007 - 05 - 14', close: 107.52 },
  { date: '2007 - 05 - 15', close: 107.34 },
  { date: '2007 - 05 - 16', close: 109.44 },
  { date: '2007 - 05 - 17', close: 110.02 },
  { date: '2007 - 05 - 20', close: 111.98 },
];

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss'],
})
export class LineComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    const marginLeft = 0;
    const width = 1000;
    const marginRight = 0;
    const marginBottom = 0;
    const height = 0;
    const marginTop = 0;

    this.LineChart(dataForChart, {
      x: (d: any) => d.date,
      y: (d: any) => d.close,
      yLabel: '↑ Daily close ($)',
      width: width,
      height: 500,
      color: 'blue',
      marginTop: marginTop,
      marginRight: marginRight,
      marginBottom: marginBottom,
      marginLeft: marginLeft,
      strokeWidth: 0,
      strokeLinejoin: '',
      strokeLinecap: '',
      xValueName: 'date',
      yValueName: 'close',
      xType: d3.scaleUtc,
      yType: d3.scaleLinear,
      xRange: [marginLeft, width - marginRight],
      yRange: [height - marginBottom, marginTop],
      curve: d3.curveLinear
    });
  }
  LineChart(data: any, chartOptions: LineChartOptions) {
    // Compute values.
    const X = d3.map(data, chartOptions.x);
    const Y = d3.map(data, chartOptions.y);
    const O = d3.map(data, (d) => d);
    const I = d3.map(data, (_, i) => i);

    // Compute which data points are considered defined.
    if (chartOptions.defined === undefined) chartOptions.defined = (d: any) => !isNaN(d[chartOptions.xValueName]) && !isNaN(d[chartOptions.yValueName]);

    const D: any[] = d3.map(data, chartOptions.defined);

    // Compute default domains.
    if (chartOptions.xDomain === undefined) chartOptions.xDomain = d3.extent((X as any));
    if (chartOptions.yDomain === undefined) chartOptions.yDomain = [0, d3.max((Y as any))];

    // Construct scales and axes.
    const xScale = chartOptions.xType(chartOptions.xDomain, chartOptions.xRange);
    const yScale = chartOptions.yType(chartOptions.yDomain, chartOptions.yRange);
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(chartOptions.width! / 80)
      .tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(chartOptions.height! / 40, chartOptions.yFormat);

    // Compute titles.
    if (chartOptions.title === undefined) {
      const formatDate = xScale.tickFormat(null, '%b %-d, %Y');
      const formatValue = yScale.tickFormat(100, chartOptions.yFormat);
      chartOptions.title = (i) => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
    } else {
      const O = d3.map(data, (d) => d);
      const T = chartOptions.title;
      chartOptions.title = (i) => T(O[i], i, data);
    }

    // Construct a line generator.
    const line = d3
      .line()
      .defined((_, i) => D[i])
      .curve(chartOptions.curve)
      .x((_, i) => xScale(X[i]))
      .y((_, i) => yScale(Y[i]));

    const svg = d3
      .select('svg')
      .attr('width', chartOptions.width)
      .attr('height', chartOptions.height)
      .attr('viewBox', [0, 0, chartOptions.width, chartOptions.height])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .style('-webkit-tap-highlight-color', 'transparent')
      .style('overflow', 'visible')
      .on('pointerenter pointermove', pointermoved)
      .on('pointerleave', pointerleft)
      .on('touchstart', (event) => event.preventDefault());

    let tooltip = svg.append('g').style('pointer-events', 'none');

    svg
      .append('g')
      .attr('transform', `translate(0,${chartOptions.height - chartOptions.marginBottom})`)
      .call(xAxis);

    svg
      .append('g')
      .attr('transform', `translate(${chartOptions.marginLeft},0)`)
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .clone()
          .attr('x2', chartOptions.width - chartOptions.marginLeft - chartOptions.marginRight)
          .attr('stroke-opacity', 0.1)
      )
      .call((g) =>
        g
          .append('text')
          .attr('x', -chartOptions.marginLeft)
          .attr('y', 10)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text(chartOptions.yLabel)
      );

    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', chartOptions.color)
      .attr('stroke-width', chartOptions.strokeWidth)
      .attr('stroke-linejoin', chartOptions.strokeLinejoin)
      .attr('stroke-linecap', chartOptions.strokeLinecap)
      .attr('d', line(data));

    

    function pointermoved(event: any) {
      // duplication to solve error
      tooltip = svg.append('g').style('pointer-events', 'none');
      const i = d3.bisectCenter((X as any), xScale.invert(d3.pointer(event)[0]));
      console.log('i ', i);
      tooltip.style('display', null);
      tooltip.attr('transform', `translate(${xScale(X[i])},${yScale(Y[i])})`);

      const path = tooltip.selectAll('path').data([,]).join('path').attr('fill', 'white').attr('stroke', 'black');

      const text = tooltip
        .selectAll('text')
        .data([,])
        .join('text')
        .call((text) =>
          text
            .selectAll('tspan')
            .data(`${chartOptions.title ? chartOptions.title(i) : 'title' }`.split(/\n/))
            .join('tspan')
            .attr('x', 0)
            .attr('y', (_, i) => `${i * 1.1}em`)
            .attr('font-weight', (_, i) => (i ? null : 'bold'))
            .text((d) => d)
        );

      const { x, y, width: w, height: h } = (text.node() as any).getBBox();
      text.attr('transform', `translate(${-w / 2},${15 - y})`);
      path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
      (svg as any).property('value', O[i]).dispatch('input', { bubbles: true });
    }

    function pointerleft() {
      tooltip.style('display', 'none');
      (svg.node() as any).value = null;
      (svg as any).dispatch('input', { bubbles: true });
    }
  }
}
