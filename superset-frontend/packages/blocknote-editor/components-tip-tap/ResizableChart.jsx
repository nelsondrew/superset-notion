import { Resizable } from 're-resizable'
import { NodeViewWrapper } from '@tiptap/react'
import styled from 'styled-components'
import { useState, useEffect, useRef } from 'react'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { PortableChart } from '../components/PortableChart'
import { useDispatch, useSelector } from 'react-redux'
import { setUnsavedChanges } from 'src/dashboard/actions/dashboardState'
import { v4 as uuidv4 } from 'uuid'
import { deleteComponent } from 'src/dashboard/actions/dashboardLayout'
import ResizableDiv from "./ResizableDiv"

const ChartContainer = styled.div`
  margin: 1rem 0;
  display: flex;
  flex-direction: ${props => props.captionAlignment === 'bottom' ? 'column' : 'row'};
  gap: 1rem;
  width: 100%;
`

const ChartWrapper = styled.div`
  display: flex;
  justify-content: ${props => {
    switch (props.alignment) {
      case 'left': return 'flex-start'
      case 'right': return 'flex-end'
      default: return 'center'
    }
  }};
  flex: 1;
  min-width: 0;

  &.drag-over {
    position: relative;
    transition: all 0.2s ease;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #3b82f6;
      opacity: 0.3;
      pointer-events: none;
      z-index: 100;
    }
  }
`

const Chart = styled.div`
  background: #ffffff;
  border: ${props => props.selected ? '2px solid #3b82f6' : '2px solid #e2e8f0'};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #64748b;
  min-height: 100px;
  width: 100%;
  height: 100%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  cursor: ${props => props.editMode ? 'pointer' : 'default'};
  position: relative;
  z-index: 1;

  &:hover {
    border-color: ${props => props.editMode ? '#3b82f6' : '#e2e8f0'};
    box-shadow: ${props => props.editMode ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};

    & ~ .resize-handle {
      opacity: ${props => props.editMode ? '0.5' : '0'};
    }
  }

  &.ProseMirror-selectednode {
    border-color: ${props => props.editMode ? '#3b82f6' : '#e2e8f0'};
    outline: ${props => props.editMode ? '3px solid rgba(59, 130, 246, 0.2)' : 'none'};
    box-shadow: ${props => props.editMode ? '0 2px 4px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};
    position: relative;
    z-index: 50;

    & ~ .resize-handle {
      opacity: ${props => props.editMode ? '1' : '0'};
    }
  }
`

const Caption = styled.div`
  color: #4b5563;
  font-size: 0.875rem;
  font-style: italic;
  order: ${props => props.captionAlignment === 'left' ? -1 : 0};
  width: ${props => {
    if (props.captionAlignment === 'bottom') return '100%';
    if (props.captionAlignment === 'left' || props.captionAlignment === 'right') {
      if (props.width !== '100%') {
        return props.width;
      }
      return '200px';
    }
    return '200px'; // fallback
  }};
  flex-shrink: 0;
  text-align: ${props => props.captionAlignment === 'bottom' ? 'center' : 'left'};
  white-space: pre-wrap;
`

const CaptionSizeControl = styled.div`
  position: absolute;
  top: -30px;
  left: 0;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  background: white;
  padding: 0.25rem;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;

  ${props => props.$visible && `
    opacity: 1;
  `}
`

const SizeButton = styled.button`
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  background: ${props => props.$active ? '#f3f4f6' : 'white'};
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`

const CaptionWrapper = styled.div`
  position: relative;
`

const EditButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2rem;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  ${Chart}:hover & {
    opacity: 1;
  }

  ${Chart}.ProseMirror-selectednode & {
    opacity: 1;
  }
`

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="16"
    height="16"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
)

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`

const ModalContent = styled.div`
  background: white;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`

const ModalTitle = styled.h3`
  margin: 0 0 24px 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
`

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #4b5563;
  font-size: 0.9375rem;
  font-weight: 500;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`

const Button = styled.button`
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.cancel {
    background: white;
    border: 1px solid #e5e7eb;
    color: #374151;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }
  }

  &.save {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: white;

    &:hover {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }
  }
`

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1f2937;
  background: white;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e1;
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
`

const generateShortId = () => {
  // Take first 10 chars of UUID
  return uuidv4().replace(/-/g, '').substring(0, 10);
};

export const ResizableChart = (nodeProps) => {
  const { node, selected, updateAttributes, deleteNode, extension } = nodeProps
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [sliceId, setSliceId] = useState(parseInt(node.attrs.chartId) || '');
  const [editorChartId, setEditorChartId] = useState(node.attrs.nodeId || '');
  const [editorChartLayoutId, setEditorChartLayoutId] = useState(node?.attrs?.chartLayoutId || '')
  const dispatch = useDispatch();

  const [realSliceId, setRealSliceId] = useState(node.attrs.chartData?.chartId || '');
  const [wrapperDimensions, setWrapperDimensions] = useState({ width: 600, height: 400 });
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const [isInTableCell, setIsInTableCell] = useState(false);
  const parentCellRef = useRef(null);
  const lastWidthRef = useRef(null);
  const resizeFrameRef = useRef(null);

  const chartWrapperRef = useRef(null);
  const resizableRef = useRef(null);
  const chartContentRef = useRef(null);
  const editMode = useSelector(state => state?.dashboardState?.editMode);

  const parentComponentId = extension.options.parentId;  // Get parent ID from extension options

  useEffect(() => {
    if (node.attrs.chartId) {
      setSliceId(node.attrs.chartId)
    }
  }, [node.attrs.chartId])

  useEffect(() => {
    dispatch(setUnsavedChanges(true));
  }, [wrapperDimensions.width, wrapperDimensions.height])

  useEffect(() => {
    const handleDeleteRequest = (event) => {
      if (selected) {
        setShowDeleteModal(true)
      }
    }

    window.addEventListener('chart-delete-request', handleDeleteRequest)
    return () => window.removeEventListener('chart-delete-request', handleDeleteRequest)
  }, [selected])

  // Update the useEffect that generates nodeId
  useEffect(() => {
    if (!node.attrs.nodeId) {
      const nodeId = `chart-${generateShortId()}`; // Will generate something like "chart-a1b2c3d4e5"
      updateAttributes({
        nodeId: nodeId
      });
      setEditorChartId(nodeId);
    }
  }, []);

  // Find parent cell and setup resize observer
  useEffect(() => {
    // Find parent cell once
    if (!parentCellRef.current && chartWrapperRef.current) {
      let element = chartWrapperRef.current;
      while (element && !element.matches('td, th')) {
        element = element.parentElement;
      }
      if (element) {
        parentCellRef.current = element;
        lastWidthRef.current = element.offsetWidth;

        // Setup resize observer for parent cell
        const observer = new ResizeObserver((entries) => {
          // Cancel any pending animation frame
          if (resizeFrameRef.current) {
            cancelAnimationFrame(resizeFrameRef.current);
          }

          const entry = entries[0];
          const newWidth = entry.contentRect.width;

          // Only trigger resize if width actually changed
          if (newWidth !== lastWidthRef.current) {
            lastWidthRef.current = newWidth;

            // Use requestAnimationFrame for smoother state updates
            resizeFrameRef.current = requestAnimationFrame(() => {
              setIsResizing(true);
            });
          }
        });

        observer.observe(element);
        return () => {
          observer.disconnect();
          if (resizeFrameRef.current) {
            cancelAnimationFrame(resizeFrameRef.current);
          }
        };
      }
    }
  }, [chartWrapperRef.current]);

  // Handle resize end with a separate effect
  useEffect(() => {
    if (isResizing) {
      const timeoutId = setTimeout(() => {
        setIsResizing(false);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isResizing]);

  // Check if chart is in table cell
  useEffect(() => {
    if (chartWrapperRef.current) {
      let element = chartWrapperRef.current;
      while (element && !element.matches('td, th')) {
        element = element.parentElement;
      }
      setIsInTableCell(!!element);
    }
  }, [chartWrapperRef.current]);

  // Original resize handlers for the chart itself
  const handleResize = (e, direction, ref) => {
    try {
      if (selected) {
        const width = parseInt(ref.style.width.replace('px', ''));
        const height = parseInt(ref.style.height.replace('px', ''));

        // Prevent state updates during table cell resize
        if (!isInTableCell || !isResizing) {
          setDimensions({ width, height });
          updateAttributes({
            width: ref.style.width,
            height: ref.style.height,
            selected: true
          });
        }
      }
    } catch (error) {
      console.warn('Resize handler error:', error);
    }
  }

  const handleResizeStop = (e, direction, ref) => {
    try {
      const width = parseInt(ref.style.width.replace('px', ''));
      const height = parseInt(ref.style.height.replace('px', ''));

      // Only update dimensions if not in table cell resize
      if (!isInTableCell || !isResizing) {
        setDimensions({ width, height });
        updateAttributes({
          width: ref.style.width,
          height: ref.style.height,
          selected: true
        });
      }

      setTimeout(() => {
        setIsResizing(false);
      }, 100);
    } catch (error) {
      console.warn('Resize stop handler error:', error);
      setIsResizing(false);
    }
  }

  const handleConfirmDelete = () => {
    if (node.attrs.chartData?.chartId) {
      dispatch(deleteComponent(node.attrs?.chartLayoutId, parentComponentId));
    }
    deleteNode()
    setShowDeleteModal(false)
  }

  const setAlignment = (alignment) => {
    const captionAlignment = (() => {
      switch (alignment) {
        case 'left': return 'right'
        case 'right': return 'left'
        default: return 'bottom'
      }
    })()

    updateAttributes({
      alignment,
      captionAlignment: node.attrs.caption ? captionAlignment : node.attrs.captionAlignment
    })
  }

  const handleCaptionSizeChange = (width) => {
    updateAttributes({
      captionWidth: width,
      selected: true
    })
  }

  const handleEditSubmit = () => {
    const numericSliceId = parseInt(sliceId, 10);
    if (!isNaN(numericSliceId)) {
      setRealSliceId(numericSliceId)
      updateAttributes({
        chartId: numericSliceId,
        selected: true
      });
      setShowEditModal(false);
    }
  }

  const captionWidth = node.attrs.captionWidth || '200px'
  const captionAlignment = node.attrs.captionAlignment || 'bottom'
  const isSideCaption = captionAlignment === 'left' || captionAlignment === 'right'

  // Update ResizeObserver effect to track both sets of dimensions
  useEffect(() => {
    if (chartContentRef.current) {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          const boundingRect = entry.target.getBoundingClientRect();
          // Update wrapper dimensions
          setWrapperDimensions({
            width: Math.round(boundingRect.width),
            height: Math.round(boundingRect.height)
          });
        }
      });

      observer.observe(chartContentRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [chartContentRef.current]);

  // Update the chart drop event listener
  useEffect(() => {
    const handleChartDrop = (event) => {
      const { dropResult, chartLayoutId = '' } = event.detail;

      // Handle the drop in the chart
      if (dropResult.dragging?.meta?.chartId) {
        const newSliceId = dropResult.dragging.meta.chartId;
        updateAttributes({
          chartData: dropResult.dragging.meta
        })
        updateAttributes({
          chartLayoutId: chartLayoutId
        });
        setEditorChartLayoutId(chartLayoutId)
        setRealSliceId(newSliceId);
        updateAttributes({
          chartId: newSliceId,
          selected: true
        });
        setShowEditModal(false);
      }
    };

    const wrapperElement = chartWrapperRef.current;

    if (wrapperElement) {
      wrapperElement.addEventListener('chart-drop', handleChartDrop);
      return () => {
        wrapperElement.removeEventListener('chart-drop', handleChartDrop);
      };
    }
  }, [chartWrapperRef.current]); // Re-run when ref is available

  return (
    <NodeViewWrapper>
      <ChartContainer
        captionAlignment={node.attrs.captionAlignment || 'bottom'}
        data-chart-node-id={node.attrs.nodeId}
        data-chart-layout-id={node.attrs.chartLayoutId}
        data-parent-id={parentComponentId}  // Optionally add to DOM for debugging
      >
        <ChartWrapper
          ref={chartWrapperRef}
          id={editorChartId}
          className='portable-chart-component'
          alignment={node.attrs.alignment || 'center'}
          width={editMode ? dimensions.width : wrapperDimensions.width}
          height={editMode ? dimensions.height : wrapperDimensions.height}
        >
          <ResizableDiv>
            <Chart
              ref={chartContentRef}
              className={selected ? 'ProseMirror-selectednode' : ''}
              data-type="chart"
              onClick={() => editMode && updateAttributes({ selected: true })}
              editMode={editMode}
            >
              {editMode && (
                <EditButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEditModal(true)
                  }}
                  title="Edit Chart ID"
                >
                  <EditIcon />
                </EditButton>
              )}

              {(realSliceId) ? (
                !isResizing ? (
                  <PortableChart
                    sliceId={parseInt(realSliceId)}
                    width={parseInt(wrapperDimensions.width)}
                    height={parseInt(wrapperDimensions.height)}
                    chartLayoutId={editorChartLayoutId}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Resizing...
                  </div>
                )
              ) : (
                'Chart'
              )}
            </Chart>
          </ResizableDiv>
        </ChartWrapper>
        {node.attrs.caption && (
          <Caption
            captionAlignment={node.attrs.captionAlignment || 'bottom'}
            width={node.attrs.captionWidth}
          >
            {node.attrs.caption}
          </Caption>
        )}
      </ChartContainer>

      {showEditModal && (
        <ModalOverlay onClick={() => setShowEditModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Edit Chart</ModalTitle>
            <div>
              <InputLabel htmlFor="slice-id">Chart ID</InputLabel>
              <Input
                id="slice-id"
                type="number"
                value={sliceId}
                onChange={(e) => setSliceId(e.target.value)}
                placeholder="Enter chart ID"
              />
            </div>
            <ButtonGroup>
              <Button
                className="cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="save"
                onClick={handleEditSubmit}
              >
                Save
              </Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </NodeViewWrapper>
  )
} 