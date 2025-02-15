import React from 'react';
import { useSelector} from 'react-redux';
import Chart from 'src/dashboard/components/gridComponents/Chart';
import { noop } from 'lodash';
import styled from 'styled-components';

interface PortableChartProps {
  sliceId: number;
  width?: number;
  height?: number;
  chartLayoutId: string;
}

const ChartWrapper = styled.div`
 .chart-slice {
  width: 100%;
  height: 100%;
 }
`

export const PortableChart: React.FC<PortableChartProps> = ({
  sliceId,
  width = 600,
  height = 400,
  chartLayoutId = '',
}) => {

  const sliceEntityData = useSelector((state) => state?.sliceEntities?.slices[sliceId]);


  // Following ChartHolder's pattern
  return (
    <ChartWrapper >
      <Chart
        componentId={chartLayoutId} // Following dashboard naming convention
        id={sliceId}
        dashboardId={39} // Not in a dashboard context
        width={width}
        height={height}
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