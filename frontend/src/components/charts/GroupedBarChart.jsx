// SimpleGroupedBarChart.jsx
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

const GroupedBarChart = ({
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 100, left: 60 },
  chartData = { data: [], groups: [], title: "Grouped Bar Chart" }
}) => {
  const svgRef = useRef();


  useEffect(() => {
    if (!chartData.data || !chartData.data.length || !chartData.groups || !chartData.groups.length) return;
    
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
    const xScale0 = d3.scaleBand()
      .domain(chartData.data.map(d => d.category))
      .range([0, chartWidth])
      .padding(0.2);
    
    const xScale1 = d3.scaleBand()
      .domain(chartData.groups)
      .range([0, xScale0.bandwidth()])
      .padding(0.05);
    
    // Find max value across all groups
    const maxValue = d3.max(chartData.data, d => 
      d3.max(chartData.groups, group => d[group] != null ? d[group] : 0)
    );
    
    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding at top
      .range([chartHeight, 0]);
    
    // Color scale for the group bars
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(chartData.groups);
    
    // Draw grouped bars
    chartData.data.forEach(d => {
      chartData.groups.forEach(group => {
        if (d[group] != null) {
          chartGroup.append('rect')
            .attr('x', xScale0(d.category) + xScale1(group))
            .attr('y', yScale(d[group]))
            .attr('width', xScale1.bandwidth())
            .attr('height', chartHeight - yScale(d[group]))
            .attr('fill', colorScale(group));
        }
      });
    });
    
    // Add a legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 150}, ${margin.top})`);

    let x_axis_label = "Category"
    
    chartData.groups.forEach((group, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      
      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(group));
      
      legendRow.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .text(group.includes("srcA")?"vehicle_sales.csv":"vehicle_sales.json");
    });
    
    // Add axes
    const xAxis = d3.axisBottom(xScale0);
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
      .text('Value');
      
  }, [chartData, width, height, margin]);


  return (
    <div className="grouped-bar-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default GroupedBarChart;