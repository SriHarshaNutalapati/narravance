import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

const TimeSeriesChart = ({
    width = 600,
    height = 400,
    margin = { top: 20, right: 30, bottom: 50, left: 60 },
    chartData = { data: [], columns: [], title: "Time Series Chart" }
  }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!chartData.data || !chartData.data.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Extract columns (excluding 'date')
    const columns = chartData.columns || 
                   Object.keys(chartData.data[0])
                        .filter(key => key !== 'date');
    
    // Create scales
    const parseDate = d3.timeParse('%Y');
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData.data, d => parseDate(d.date)))
      .range([0, chartWidth]);
    
    // Find max value across all columns
    const maxValue = d3.max(chartData.data, d => 
      d3.max(columns, column => d[column] != null ? d[column] : 0)
    );
    
    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding at top
      .range([chartHeight, 0]);
    
    // Color scale for the lines
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(columns);
    
    // Draw a line for each column
    columns.forEach(column => {
      // Create line generator
      const line = d3.line()
        .defined(d => d[column] != null)
        .x(d => xScale(parseDate(d.date)))
        .y(d => yScale(d[column] || 0));
      
      // Draw the line
      chartGroup.append('path')
        .datum(chartData.data)
        .attr('fill', 'none')
        .attr('stroke', colorScale(column))
        .attr('stroke-width', 2)
        .attr('d', line);
        
      // Add points
      chartGroup.selectAll(`.dot-${column.replace(/\W/g, '')}`)
        .data(chartData.data.filter(d => d[column] != null))
        .enter()
        .append('circle')
        .attr('class', `dot-${column.replace(/\W/g, '')}`)
        .attr('cx', d => xScale(parseDate(d.date)))
        .attr('cy', d => yScale(d[column]))
        .attr('r', 4)
        .attr('fill', colorScale(column));
    });
    
    // Add a legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 150}, ${margin.top})`);
    
    columns.forEach((column, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      
      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(column));
      
      legendRow.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .text(column.includes("srcA")?"vehicle_sales.csv":"vehicle_sales.json");
    });
    
    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    chartGroup.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);
    
    chartGroup.append('g')
      .call(yAxis);
    
    // Add axis labels
    chartGroup.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 40})`)
      .style('text-anchor', 'middle')
      .text('Date');
    
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -chartHeight / 2)
      .style('text-anchor', 'middle')
      .text(chartData.columns[0].split("_")[0]);
      
  }, [chartData, width, height, margin]);

  // if (!data.data || !data.data.length) return <div>No data available</div>;

  return (
    <div className="time-series-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TimeSeriesChart;