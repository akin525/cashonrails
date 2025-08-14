import React, { useRef, useEffect, useState } from "react";
import {
  select,
  scaleTime,
  scaleLinear,
  area,
  line,
  max,
  extent,
  curveCardinal,
  axisBottom,
  axisLeft,
  zoom,
  ZoomTransform,
} from "d3";
import useResizeObserver from "./useResizeObserver";

interface ZoomableAreaChartProps {
  data: { x: string | Date; y: number }[]; // Data contains objects with x and y values
  id?: string;
  width?: number | string;
  height?: number | string;
  xAxis: {
    label: string; // Label for the X Axis
    hideLine?: boolean; // Whether to hide the X Axis line
  };
  yAxis: {
    label: string; // Label for the Y Axis
    hideLine?: boolean; // Whether to hide the Y Axis line
  };
  gradient?: {
    startColor: string; // Start color for the gradient
    endColor: string; // End color for the gradient
  };
  areaStrokeColor?: string; // Stroke color of the area line
  zoomControl?: {
    scaleExtent?: [number, number]; // Zoom scale extent
    translateExtent?: [[number, number], [number, number]]; // Zoom translation extent
  };
  hideAxesLines?: boolean; // Hide both axis lines (X and Y)
}

const ZoomableAreaChart: React.FC<ZoomableAreaChartProps> = ({
  data,
  id = "myZoomableAreaChart",
  width = "100%",
  height = 400,
  xAxis = { label: "X Axis", hideLine: false },
  yAxis = { label: "Y Axis", hideLine: false },
  gradient = { startColor: "lightblue", endColor: "blue" },
  areaStrokeColor = "black",
  zoomControl = { scaleExtent: [1, 5], translateExtent: [[0, 0], [Infinity, Infinity]] },
  hideAxesLines = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(wrapperRef);
  const [currentZoomState, setCurrentZoomState] = useState<ZoomTransform>();

  useEffect(() => {
    if (!dimensions) return; // Early return if no dimensions

    const svg = select(svgRef.current!); // Use non-null assertion
    const svgContent = svg.select<SVGGElement>(".content");
    const { width: boundedWidth, height: boundedHeight } = dimensions;

    // scales + area generator with proper padding (left: 50px, right: 50px)
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    const xScale = scaleTime()
      .domain(extent(data, (d) => new Date(d.x)) as [Date, Date]) // Use x values from data
      .range([margin.left, boundedWidth - margin.right]); // Set margin

    if (currentZoomState) {
      const newXScale = currentZoomState.rescaleX(xScale);
      xScale.domain(newXScale.domain());
    }

    const yScale = scaleLinear()
      .domain([0, max(data, (d) => d.y) || 0]) // Use y values from data
      .range([boundedHeight - margin.bottom, margin.top]); // Set margin

    const areaGenerator = area<{ x: string | Date; y: number }>()
      .x((d) => xScale(new Date(d.x))) // Use the x value for the area
      .y0(boundedHeight - margin.bottom) // Bottom of the area chart
      .y1((d) => yScale(d.y)) // Use the y value for the area
      .curve(curveCardinal); // Curve for smoothness

    const lineGenerator = line<{ x: string | Date; y: number }>()
      .x((d) => xScale(new Date(d.x))) // Use the x value for the line
      .y((d) => yScale(d.y)) // Use the y value for the line
      .curve(curveCardinal); // Curve for smoothness

    // render the area
    svgContent
      .selectAll<SVGPathElement, { x: string | Date; y: number }[]>(".myArea")
      .data([data])
      .join("path")
      .attr("class", "myArea")
      .attr("fill", "url(#areaGradient)")
      .attr("d", areaGenerator);

    // render the line
    svgContent
      .selectAll<SVGPathElement, { x: string | Date; y: number }[]>(".myLine")
      .data([data])
      .join("path")
      .attr("class", "myLine")
      .attr("fill", "none")
      .attr("stroke", areaStrokeColor)
      .attr("strokeWidth", 2)
      .attr("d", lineGenerator);

    // Create axes
    const xAxisScale = axisBottom(xScale);
    const yAxisScale = axisLeft(yScale);

    svg
      .select<SVGGElement>(".x-axis")
      .attr("transform", `translate(0, ${boundedHeight - margin.bottom})`)
      .call(xAxisScale);

    svg
      .select<SVGGElement>(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxisScale);

    if (xAxis.hideLine) {
      svg.select<SVGGElement>(".x-axis").select(".domain").remove();
    }

    if (yAxis.hideLine) {
      svg.select<SVGGElement>(".y-axis").select(".domain").remove();
    }

    // Zoom behavior
      // Zoom behavior
      const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5]) // Set the zoom scale extent
      .translateExtent([
        [margin.left, margin.top],
        [boundedWidth - margin.right, boundedHeight - margin.bottom]
      ]) // Set the translate extent
      .extent([
        [margin.left, margin.top],
        [boundedWidth - margin.right, boundedHeight - margin.bottom]
      ]) // Set the extent for zooming
      .on("zoom", (event) => {
        const zoomState = event.transform;
        setCurrentZoomState(zoomState);
        svgContent.attr("transform", zoomState.toString());
        svg.select<SVGGElement>(".x-axis").call(xAxisScale.scale(zoomState.rescaleX(xScale)));
        svg.select<SVGGElement>(".y-axis").call(yAxisScale.scale(zoomState.rescaleY(yScale)));

        // Update the area and line paths during zoom
        svgContent
          .selectAll<SVGPathElement, { x: string | Date; y: number }[]>(".myArea")
          .attr("d", areaGenerator);

        svgContent
          .selectAll<SVGPathElement, { x: string | Date; y: number }[]>(".myLine")
          .attr("d", lineGenerator);

        if (xAxis.hideLine) {
          svg.select<SVGGElement>(".x-axis").select(".domain").remove();
        }

        if (yAxis.hideLine) {
          svg.select<SVGGElement>(".y-axis").select(".domain").remove();
        }
      });

    svg.call(zoomBehavior);
  }, [areaStrokeColor, currentZoomState, data, dimensions, xAxis.hideLine, yAxis.hideLine]);

  return (
    <div ref={wrapperRef} style={{ width, height, marginBottom: "2rem" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }}>
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width="100%" height="100%" />
          </clipPath>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradient.startColor} />
            <stop offset="100%" stopColor={gradient.endColor} />
          </linearGradient>
        </defs>
        <g className="content" clipPath={`url(#${id})`}></g>
        <g className="x-axis" />
        <g className="y-axis" />
        {dimensions && (
          <>
            {/* X Axis Label */}
            <text
              x={dimensions.width / 2}
              y={dimensions.height - 10}
              textAnchor="middle"
              style={{ fontSize: "12px", fill: "black" }}
            >
              {xAxis.label}
            </text>
            {/* Y Axis Label */}
            <text
              x={-dimensions.height / 2}
              y={15}
              textAnchor="middle"
              transform="rotate(-90)"
              style={{ fontSize: "12px", fill: "black" }}
            >
              {yAxis.label}
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export default ZoomableAreaChart;