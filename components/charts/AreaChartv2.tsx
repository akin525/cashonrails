import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface DataPoint {
  date: Date;
  value: number;
}

const AreaChart = ({ data }: { data: DataPoint[] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Set dimensions
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create area generator
    const areaGenerator = d3
      .area<DataPoint>()
      .x((d) => xScale(d.date))
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.value));

    // Select the SVG element
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous elements
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Create clipPath to prevent overflow
    svg.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top);

    // Create a group for the chart content
    const chartGroup = svg.append("g").attr("clip-path", "url(#clip)");

    // Create area path
    const areaPath = chartGroup
      .append("path")
      .datum(data)
      .attr("fill", "steelblue")
      .attr("opacity", 0.6)
      .attr("d", areaGenerator);

    // Create axes
    const xAxis = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    const yAxis = svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Define zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5]) // Set zoom scale limits
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        xAxis.call(d3.axisBottom(newXScale));

        // Update area with new xScale
        areaPath.attr("d", areaGenerator.x((d) => newXScale(d.date)));
      });

    // Apply zoom behavior safely
    svg.call(zoom as any);
  }, [data]);

  return <svg ref={svgRef} width={600} height={300} style={{ border: "1px solid #ccc" }}></svg>;
};

export default AreaChart;
