import { Resizable } from 're-resizable'
import { NodeViewWrapper } from '@tiptap/react'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'

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
`

const Chart = styled.div`
  background: #ffffff;
  border: 2px solid #e2e8f0;
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
  cursor: pointer;
  position: relative;
  z-index: 1;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    & ~ .resize-handle {
      opacity: 0.5;
    }
  }

  &.ProseMirror-selectednode {
    border-color: #3b82f6;
    outline: 2px solid rgba(59, 130, 246, 0.2);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
    position: relative;
    z-index: 50;

    & ~ .resize-handle {
      opacity: 1;
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
      if(props.width !== '100%') {
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

export const ResizableChart = ({ node, selected, updateAttributes, deleteNode }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const alignment = node.attrs.alignment || 'center'

  useEffect(() => {
    const handleDeleteRequest = (event) => {
      if (selected) {
        setShowDeleteModal(true)
      }
    }

    window.addEventListener('chart-delete-request', handleDeleteRequest)
    return () => window.removeEventListener('chart-delete-request', handleDeleteRequest)
  }, [selected])

  const handleConfirmDelete = () => {
    deleteNode()
    setShowDeleteModal(false)
  }

  const handleResize = (e, direction, ref) => {
    if (selected) {
      updateAttributes({ 
        width: ref.style.width,
        height: ref.style.height,
        selected: true 
      })
    }
  }

  const handleResizeStop = (e, direction, ref) => {
    updateAttributes({
      width: ref.style.width,
      height: ref.style.height,
      selected: true
    })
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

  const captionWidth = node.attrs.captionWidth || '200px'
  const captionAlignment = node.attrs.captionAlignment || 'bottom'
  const isSideCaption = captionAlignment === 'left' || captionAlignment === 'right'

  return (
    <NodeViewWrapper>
      <ChartContainer captionAlignment={node.attrs.captionAlignment || 'bottom'}>
        <ChartWrapper alignment={alignment}>
          <Resizable
            defaultSize={{
              width: node.attrs.width || '600px',
              height: node.attrs.height || '200px',
            }}
            size={{
              width: node.attrs.width || '600px',
              height: node.attrs.height || '200px',
            }}
            minHeight={100}
            minWidth={200}
            maxWidth="100%"
            enable={{
              top: false,
              right: true,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: true,
              bottomLeft: false,
              topLeft: false,
            }}
            handleStyles={{
              right: { 
                width: '2px',
                right: '-1px',
                top: '0',
                bottom: '0',
                cursor: 'ew-resize',
                background: selected ? '#3b82f6' : '#e2e8f0',
                border: 'none',
                transition: 'all 0.2s ease',
                opacity: 0
              },
              bottom: { 
                height: '2px',
                bottom: '-1px',
                left: '0',
                right: '0',
                cursor: 'ns-resize',
                background: selected ? '#3b82f6' : '#e2e8f0',
                border: 'none',
                transition: 'all 0.2s ease',
                opacity: 0
              },
              bottomRight: { 
                width: '6px',
                height: '6px',
                bottom: '-2px',
                right: '-2px',
                cursor: 'nwse-resize',
                background: selected ? '#3b82f6' : '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                opacity: 0
              },
            }}
            handleClasses={{
              right: 'resize-handle',
              bottom: 'resize-handle',
              bottomRight: 'resize-handle',
            }}
            onResize={handleResize}
            onResizeStop={handleResizeStop}
          >
            <Chart 
              className={selected ? 'ProseMirror-selectednode' : ''}
              data-type="chart"
              onClick={() => updateAttributes({ selected: true })}
            >
              Chart
            </Chart>
          </Resizable>
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
      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </NodeViewWrapper>
  )
} 