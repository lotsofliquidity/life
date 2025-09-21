import React, { useRef, useEffect } from "react";
import * as echarts from "echarts";

export interface EChartProps {
  option: echarts.EChartsOption;
  style?: React.CSSProperties;
}

const EChart: React.FC<EChartProps> = ({ option, style }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      chartInstance.current.setOption(option);
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [option]);

  return <div ref={chartRef} style={style} />;
};

export default EChart;
