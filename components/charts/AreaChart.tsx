import React, { SVGAttributes, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type FontWeight = "normal" | "bold" | "bolder" | "lighter" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

interface LineChartProps {
  data: { x: number | string; y: number }[];
  width: number;
  height: number;
  colors: {
    lineStroke: string;
    axisColor: string;
    textColor: string;
    gradientColors: [string, string];
  };
  axisLabels: {
    xAxisLabel: string;
    yAxisLabel: string;
    labelFont?: string; // Font for axis labels
    labelFontSize?: number; // Font size for axis labels
    labelFontWeight?: FontWeight; // Font weight for axis labels
  };
  xAxis?: {
    hideLine?: boolean;
    tickFormat?: (value: number | string) => string;
    tickSize?: number;
    tickFont?: string; // Font for tick labels
    tickFontSize?: number; // Font size for tick labels
    tickFontWeight?: FontWeight; // Font weight for tick labels
  };
  yAxis?: {
    hideLine?: boolean;
    tickFormat?: (value: number) => string;
    tickSize?: number;
    tickFont?: string; // Font for tick labels
    tickFontSize?: number; // Font size for tick labels
    tickFontWeight?: FontWeight; // Font weight for tick labels
  };
  responsive?: boolean;
  tooltipSettings?: {
    backgroundColor?: string;
    fontSize?: string;
    padding?: string;
    formatTooltip?: (data: { x: number | string; y: number }) => string;
  };
  tooltipComponent?: React.ComponentType<{ data: { x: number | string; y: number } }>;
}

/**
 * LineChart component to render a line chart with optional area fill and custom tooltips.
 *
 * @param {LineChartProps} props - The properties for the LineChart component.
 * @returns {JSX.Element} The rendered LineChart component.
 *
 * @example
 * // Example usage with custom tooltip component
 * const CustomTooltip = ({ data }) => (
 *   <div>
 *     <strong>{data.x}</strong>: {data.y}
 *   </div>
 * );
 *
 * const data = [
 *   { x: 1, y: 10 },
 *   { x: 2, y: 20 },
 *   { x: 3, y: 30 },
 * ];
 *
 * <LineChart
 *   data={data}
 *   width={500}
 *   height={300}
 *   colors={{
 *     lineStroke: "#ff0000",
 *     axisColor: "#000000",
 *     textColor: "#000000",
 *     gradientColors: ["#ff0000", "#ffffff"],
 *   }}
 *   axisLabels={{
 *     xAxisLabel: "X Axis",
 *     yAxisLabel: "Y Axis",
 *   }}
 *   tooltipComponent={CustomTooltip}
 * />
 */
const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  colors,
  axisLabels,
  xAxis = {},
  yAxis = {},
  responsive = false,
  tooltipSettings = {},
  tooltipComponent: TooltipComponent,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGGElement>(null);
  const axesRef = useRef<SVGGElement>(null);
  const [chartWidth, setChartWidth] = useState(width);
  const [chartHeight, setChartHeight] = useState(height);
  const [hoveredData, setHoveredData] = useState<{ x: number | string; y: number } | null>(null);
  const [currentZoomState, setCurrentZoomState] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  // Tooltip Styles
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    backgroundColor: tooltipSettings.backgroundColor || "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: tooltipSettings.padding || "8px",
    fontSize: tooltipSettings.fontSize || "12px",
    borderRadius: "4px",
    pointerEvents: "none",
    visibility: hoveredData ? "visible" : "hidden",
    transition: "all 0.2s ease",
  };


  useEffect(() => {
    if (responsive && chartRef.current) {
      const handleResize = () => {
        setChartWidth(chartRef.current!.clientWidth);
        setChartHeight(chartRef.current!.clientHeight);
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [responsive]);

  // Chart Dimensions
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const boundsWidth = chartWidth - margin.left - margin.right;
  const boundsHeight = chartHeight - margin.top - margin.bottom;

  // Base Scales
  const xScale = d3
    .scalePoint()
    .domain(data.map((d) => d.x.toString()))
    .range([0, boundsWidth])
    .padding(0);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.y) || 0])
    .nice()
    .range([boundsHeight, 0]);

  // Line Path
  const linePath = d3
    .line<{ x: number | string; y: number }>()
    .x((d) => xScale(d.x.toString()) as number) // Convert x values to strings
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneX)(data) || "";

  // Area Path
  const areaPath = d3
    .area<{ x: number | string; y: number }>()
    .x((d) => xScale(d.x.toString()) as number) // Convert x values to strings
    .y0(boundsHeight)
    .y1((d) => yScale(d.y))
    .curve(d3.curveMonotoneX)(data) || "";

    // Initialize zoom behavior
  useEffect(() => {
    if (!svgRef.current || !contentRef.current) return;

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 20]) // Min and max zoom level
      .extent([[0, 0], [boundsWidth, boundsHeight]])
      .on("zoom", (event) => {
        setCurrentZoomState(event.transform);
        
        // Apply the transform to the content group
        d3.select(contentRef.current).attr("transform", event.transform.toString());
        
        // Update axes with the new transform
        const newXScale = event.transform.rescaleX(xScale);
        const xAxisFn = d3.axisBottom(newXScale);
        d3.select(axesRef.current).select<SVGGElement>(".x-axis").call(xAxisFn);
      });

    // Apply zoom behavior to the SVG
    d3.select(svgRef.current)
      .call(zoom as any)

  }, [boundsWidth, boundsHeight, xScale, data]);

  
  // Axes
  useEffect(() => {
    if (axesRef.current) {
      const xAxisFn = d3.axisBottom(xScale);
      const yAxisFn = d3.axisLeft(yScale);

      if (xAxis.tickFormat) xAxisFn.tickFormat((d, i) => xAxis.tickFormat!(d as number | string));
      if (xAxis.tickSize) xAxisFn.tickSize(xAxis.tickSize);

      if (yAxis.tickFormat) yAxisFn.tickFormat((d, i) => yAxis.tickFormat!(d as number));
      if (yAxis.tickSize) yAxisFn.tickSize(yAxis.tickSize);

      // Hide X axis line if hideLine is true
      if (xAxis.hideLine) {
        d3.select(axesRef.current).select<SVGGElement>(".x-axis").selectAll("path, line").style("stroke", "none");
      } else {
        d3.select(axesRef.current).select<SVGGElement>(".x-axis").style("stroke", colors.axisColor);
      }

      // Hide Y axis line if hideLine is true
      if (yAxis.hideLine) {
        d3.select(axesRef.current).select<SVGGElement>(".y-axis").selectAll("path, line").style("stroke", "none");
      } else {
        d3.select(axesRef.current).select<SVGGElement>(".y-axis").style("stroke", colors.axisColor);
      }

      d3.select(axesRef.current).select<SVGGElement>(".x-axis").call(xAxisFn);
      d3.select(axesRef.current).select<SVGGElement>(".y-axis").call(yAxisFn);
    }
  }, [xScale, yScale, xAxis, yAxis, colors.axisColor]);

  // Handle Hover Event
  const handleMouseOver = (event: React.MouseEvent<SVGPathElement>) => {
    const [x, y] = d3.pointer(event);
    const index = Math.round(xScale.domain().length * (x / boundsWidth));
    if (index >= 0 && index < xScale.domain().length) {
      const xValue = xScale.domain()[index];
      const yValue = yScale.invert(y);
      setHoveredData({ x: xValue, y: yValue });
    } else {
      setHoveredData(null);
    }
  };

  const handleMouseOut = () => {
    setHoveredData(null);
  };

  return (
    <div ref={chartRef} style={{ width: responsive ? "100%" : width, height: responsive ? "100%" : height }}>
      <svg width={chartWidth} height={chartHeight}>
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.gradientColors[0]} />
            <stop offset="100%" stopColor={colors.gradientColors[1]} />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Area Path with Gradient */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            fillOpacity={0.8}
            stroke="none"
            onMouseMove={handleMouseOver}
            onMouseOut={handleMouseOut}
          />
          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke={colors.lineStroke}
            strokeWidth={2}
            onMouseMove={handleMouseOver}
            onMouseOut={handleMouseOut}
          />
        </g>

        {/* Axes */}
        <g
          ref={axesRef}
          transform={`translate(${margin.left},${margin.top})`}
          style={{
            color: colors.axisColor,
          }}
        >
          <g className="x-axis" transform={`translate(0, ${boundsHeight})`} />
          <g className="y-axis" />
        </g>

        {/* Axis Labels */}
        <text
          x={margin.left + boundsWidth / 2}
          y={chartHeight - 5}
          textAnchor="middle"
          fill={colors.textColor}
          fontFamily={axisLabels.labelFont || "Arial"}
          fontSize={axisLabels.labelFontSize || 12}
          fontWeight={axisLabels.labelFontWeight || "normal"}
        >
          {axisLabels.xAxisLabel}
        </text>
        <text
          transform="rotate(-90)"
          x={-margin.top - boundsHeight / 2}
          y={15}
          textAnchor="middle"
          fill={colors.textColor}
          fontFamily={axisLabels.labelFont || "Arial"}
          fontSize={axisLabels.labelFontSize || 12}
          fontWeight={axisLabels.labelFontWeight || "normal"}
        >
          {axisLabels.yAxisLabel}
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredData && (
        <div
          style={{
            ...tooltipStyle,
            left: `${xScale(hoveredData.x.toString())! + margin.left}px`,
            bottom: `${yScale(hoveredData.y) + margin.top - 20}px`, // Adjusted to position closer to the cursor
          }}
        >
          {TooltipComponent ? (
            <TooltipComponent data={hoveredData} />
          ) : (
            tooltipSettings.formatTooltip ? tooltipSettings.formatTooltip(hoveredData) : `${hoveredData.x}: ${hoveredData.y}`
          )}
        </div>
      )}
    </div>
  );
};

export default LineChart;