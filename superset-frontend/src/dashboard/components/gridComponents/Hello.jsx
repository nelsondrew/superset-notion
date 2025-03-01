import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { styled, t } from '@superset-ui/core';
import { useSelector } from 'react-redux';
import { DragDroppable } from '../dnd/DragDroppable';
import { CHART_TYPE, PORTABLE_CHART_TYPE } from '../../util/componentTypes';
import BlockNoteEditor from "../../../../packages/blocknote-editor/index"
import DeleteComponentButton from '../DeleteComponentButton';
import { v4 as uuidv4 } from 'uuid';

const HelloDiv = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 8px;
  text-align: center;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.primary.base};
  }
`;

const DeleteButtonContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: ${({ editMode }) => (editMode ? 'block' : 'none')};
`;

const propTypes = {
  id: PropTypes.string.isRequired,
  parentId: PropTypes.string.isRequired,
  component: PropTypes.object.isRequired,
  parentComponent: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  depth: PropTypes.number.isRequired,
  editMode: PropTypes.bool.isRequired,
  handleComponentDrop: PropTypes.func.isRequired,
  deleteComponent: PropTypes.func.isRequired,
};

export default function Hello(props) {
  const {
    id,
    component,
    parentComponent,
    index,
    depth,
    deleteComponent,
  } = props;

  const { editMode } = props;
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const pendingChartDropRef = useRef(null);
  const [hoveredPos , setHoveredPos] = useState(null);
  
  // Add selector to get latest dashboard layout
  const dashboardLayout = useSelector(state => state.dashboardLayout.present);

  useEffect(() => {
    const editorElement = document.querySelector('.blocknote-editor');
    if (editorElement) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-editor-focused') {
            setIsEditorFocused(editorElement.getAttribute('data-editor-focused') === 'true');
          }
        });
      });

      observer.observe(editorElement, {
        attributes: true,
        attributeFilter: ['data-editor-focused']
      });

      return () => observer.disconnect();
    }
  }, []);

  // Watch for changes in dashboard layout
  useEffect(() => {
    if (pendingChartDropRef.current) {
      const { previousChildrenIds, highlightedChart, dropResult } = pendingChartDropRef.current;
      const updatedComponent = dashboardLayout[id];
      const updatedChildren = updatedComponent?.children || [];
      
      // Find the newly added child ID
      const newChildId = updatedChildren
        .find(id => !previousChildrenIds.includes(id));

      if (newChildId) {
        // Emit custom event with dropResult data and new chart ID
        const chartDropEvent = new CustomEvent('chart-drop', {
          detail: {
            dropResult,
            chartLayoutId: newChildId,
            targetElement: highlightedChart
          },
          bubbles: true
        });
        highlightedChart.dispatchEvent(chartDropEvent);
        
        // Clear the pending drop
        pendingChartDropRef.current = null;
      }
    }
  }, [props.component]);

  const handleHover = (hoverProps, monitor) => {
    if (!monitor) return;
    
    const editor = window.editor;
    if (!editor) return;

    if (!monitor.isOver()) {
      // Clear decorations when not hovering
      editor.setHoveredPos(null);
      return;
    }
    
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) return;

    const itemType = monitor.getItem()?.type;
    if (itemType !== CHART_TYPE) return;

    // Get the position in the document from mouse coordinates
    const pos = editor.view.posAtCoords({
      left: clientOffset.x,
      top: clientOffset.y
    });

    if (pos) {
      // Get the node at this position
      const $pos = editor.state.doc.resolve(pos.pos);
      
      // Find the closest paragraph node
      let depth = $pos.depth;
      while (depth > 0) {
        const node = $pos.node(depth);
        if (node.type.name === 'paragraph') {
          console.log("got the para" ,node)
          // Set the position to highlight
          const pos = $pos.before(depth);
          console.log(pos, "from hello")
          setHoveredPos(pos+1)
          // editor.setHoveredPos($pos.before(depth));
          break;
        }
        depth--;
      }
    } else {
      setHoveredPos(null);
      // editor.setHoveredPos(null);
    }

    // Handle chart highlights
    const chartElements = document.querySelectorAll('.portable-chart-component');
    chartElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isOverChart = (
        clientOffset.x >= rect.left &&
        clientOffset.x <= rect.right &&
        clientOffset.y >= rect.top &&
        clientOffset.y <= rect.bottom
      );
      
      if (isOverChart) {
        element.classList.add('drag-over');
      } else {
        element.classList.remove('drag-over');
      }
    });
  };

  const handleDrop = (dropResult, monitor) => {
    // Remove drag-over class from all chart elements
    document.querySelectorAll('.portable-chart-component').forEach(element => {
      element.classList.remove('drag-over');
    });

    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) {
      console.log('No client offset found');
      return;
    }

    const editor = window.editor;
    if (!editor) return;

    if (hoveredPos !== null) {
      try {
        // First get the node at the hovered position
        const $pos = editor.state.doc.resolve(hoveredPos);
        let targetPos = hoveredPos;

        // Find the paragraph node
        for (let depth = $pos.depth; depth > 0; depth--) {
          const node = $pos.node(depth);
          if (node.type.name === 'paragraph') {
            targetPos = $pos.before(depth);
            break;
          }
        }

        const chartId = uuidv4();
        
        // Create a new chart node
        editor.chain()
          .focus()
          .setNodeSelection(targetPos)
          .insertContent({
            type: 'chart',
            attrs: {
              nodeId: chartId,
              chartData: null,
              width : "800px",
              height: "400px"
            }
          })
          .run();

        // Get the DOM node directly from editor view
        const chartNode = editor.view.domAtPos(targetPos + 1);
        const chartElement = chartNode?.node?.querySelector('.portable-chart-component');

        // Get the current children IDs before the drop
        const previousChildrenIds = component.children ? component.children : [];

        // Save drop details in ref with the chart element
        pendingChartDropRef.current = {
          previousChildrenIds,
          highlightedChart: chartElement,
          dropResult
        };

        if (!component.children) {
          component.children = [];
        }
        
        // Handle the component drop
        props.handleComponentDrop({
          ...dropResult,
          destination: {
            ...dropResult.destination,
            id: component.id,
            type: component.type,
            index: component.children.length,
          },
        });

        setHoveredPos(null);

        return;
      } catch (error) {
        console.error('Error inserting chart:', error);
      }
    }

    // Fallback to old chart handling if no hovered position
    const chartElements = document.querySelectorAll('.portable-chart-component');
    const highlightedChart = Array.from(chartElements).find(element => {
      const rect = element.getBoundingClientRect();
      return (
        clientOffset.x >= rect.left &&
        clientOffset.x <= rect.right &&
        clientOffset.y >= rect.top &&
        clientOffset.y <= rect.bottom
      );
    });

    const highlightedChartId = highlightedChart?.id || '';
    const metaEditorJsonContent = component?.meta?.editorJson?.content || [];
    const chartElementsOfEditor = metaEditorJsonContent.filter((item) => item?.type === 'chart');
    const highlightedChartMeta = chartElementsOfEditor.find((item) => item?.attrs?.nodeId === highlightedChartId);
    const alreadyHasChart = !!(highlightedChartMeta?.attrs?.chartData?.chartId);

    if(highlightedChartId && alreadyHasChart) {
      console.log("Drop cancelled , it already has a chart");
      return;
    }

    if (!highlightedChart || alreadyHasChart) {
      console.log('Drop cancelled - not on chart element');
      return;
    }

    // Store the current children IDs before the drop
    const previousChildrenIds = component.children ? component.children : [];

    // Save drop details in ref for later processing
    pendingChartDropRef.current = {
      previousChildrenIds,
      highlightedChart,
      dropResult
    };

    if (!component.children) {
      component.children = [];
    }
    
    // Handle the component drop
    props.handleComponentDrop({
      ...dropResult,
      destination: {
        ...dropResult.destination,
        id: component.id,
        type: component.type,
        index: component.children.length,
      },
    });
  };

  const handleDelete = () => {
    deleteComponent(id, parentComponent.id);
  };

  return (
    <DragDroppable
      component={component}
      parentComponent={parentComponent}
      orientation="column"
      index={index}
      depth={depth}
      onDrop={handleDrop}
      onHover={handleHover}
      editMode={editMode}
      droppable
      disableDragDrop={isEditorFocused}
      acceptedChildren={[CHART_TYPE]}
    >
      {({ dragSourceRef }) => (
        <HelloDiv id={component?.id} ref={dragSourceRef}>
          <BlockNoteEditor
            handleComponentDrop={props.handleComponentDrop}
            hoveredPos={hoveredPos}
            setHoveredPos={setHoveredPos}
            component={component} />
          {editMode && (
            <DeleteButtonContainer editMode={editMode}>
              <DeleteComponentButton
                onDelete={handleDelete}
                tooltip={t('Remove')}
              />
            </DeleteButtonContainer>
          )}
        </HelloDiv>
      )}
    </DragDroppable>
  );
}

Hello.propTypes = propTypes; 