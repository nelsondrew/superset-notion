import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Chart from 'src/dashboard/components/gridComponents/Chart';
import { noop } from 'lodash';
import styled from 'styled-components';

interface PortableChartProps {
  sliceId: number;
  width?: number;
  height?: number;
}

const ChartWrapper = styled.div`
 .chart-slice {
  width: ${props => props.width}px !important;
  height: ${props => props.height}px !important;
 }
`

export const PortableChart: React.FC<PortableChartProps> = ({
  sliceId,
  width = 600,
  height = 400,
}) => {
  const dispatch = useDispatch();

  // Ensure width and height are numbers
  const numericWidth = typeof width === 'string' ? parseInt(width) : width;
  const numericHeight = typeof height === 'string' ? parseInt(height) : height;
  const state = useSelector(state => state);

  const sliceEntityData = useSelector((state) => state?.sliceEntities?.slices[sliceId]);


  // Following ChartHolder's pattern
  return (
    <ChartWrapper width={numericWidth} height={numericHeight}>
      <Chart
        componentId={`CHART-${sliceId}`} // Following dashboard naming convention
        id={sliceId}
        dashboardId={39} // Not in a dashboard context
        width={numericWidth}
        height={numericHeight}
        sliceName={
          sliceEntityData?.slice_name || ''
        }
        updateSliceName={noop}
        isComponentVisible={true}
        handleToggleFullSize={noop}
        isFullSize={false}
        setControlValue={noop}
        extraControls={[]}
        isInView={true}
      />
    </ChartWrapper>
  );
}; 