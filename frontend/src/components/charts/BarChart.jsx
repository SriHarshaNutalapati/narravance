// SimpleBarChart.jsx
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ 
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 100, left: 60 },
  chartData = { data: [], columns: [], title: "Bar Chart" }
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if(!chartData.data || !chartData.data.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(chartData.data.map(d => d.category))
      .range([0, chartWidth])
      .padding(0.2);
    
    // Determine columns (excluding 'category')
    const columns = chartData.columns || 
                    Object.keys(chartData.data[0])
                         .filter(key => key !== 'category');
    
    if (columns.length > 1) {
      // Multiple measures - draw grouped bars
      const xScaleInner = d3.scaleBand()
        .domain(columns)
        .range([0, xScale.bandwidth()])
        .padding(0.05);
      
      // Find the max value across all columns
      const maxValue = d3.max(chartData.data, d => 
        d3.max(columns, column => d[column] != null ? d[column] : 0)
      );
      
      const yScale = d3.scaleLinear()
        .domain([0, maxValue * 1.1]) // Add 10% padding at top
        .range([chartHeight, 0]);
      
      // Color scale for different measures
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(columns);
      
      // Draw grouped bars for each measure
      chartData.data.forEach(d => {
        columns.forEach(column => {
          if (d[column] != null) {
            chartGroup.append('rect')
              .attr('x', xScale(d.category) + xScaleInner(column))
              .attr('y', yScale(d[column]))
              .attr('width', xScaleInner.bandwidth())
              .attr('height', chartHeight - yScale(d[column]))
              .attr('fill', colorScale(column));
          }
        });
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
          .text(column);
      });
      
      // Add axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);
      
      chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis)
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em');
      
      chartGroup.append('g')
        .call(yAxis);
    } else {
      // Single measure - draw regular bars
      const column = columns[0];
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(chartData.data, d => d[column] || 0) * 1.1]) // Add 10% padding at top
        .range([chartHeight, 0]);
      
      chartGroup.selectAll('rect')
        .data(chartData.data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.category))
        .attr('y', d => yScale(d[column] || 0))
        .attr('width', xScale.bandwidth())
        .attr('height', d => chartHeight - yScale(d[column] || 0))
        .attr('fill', 'steelblue');
      
      // Add bar labels
      chartGroup.selectAll('.bar-label')
        .data(chartData.data)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d[column] || 0) - 5)
        .attr('text-anchor', 'middle')
        .text(d => d[column] != null ? d[column].toLocaleString(undefined, { maximumFractionDigits: 0 }) : '');
      
      // Add axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);
      
      chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis)
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em');
      
      chartGroup.append('g')
        .call(yAxis);
    }
    
    // Add axis labels
    chartGroup.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 60})`)
      .style('text-anchor', 'middle')
      .text('Category');
    
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -chartHeight / 2)
      .style('text-anchor', 'middle')
      .text(chartData.columns[0].split("_")[0]);
    
  }, [chartData, width, height, margin]);


  return (
    <div className="bar-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarChart;