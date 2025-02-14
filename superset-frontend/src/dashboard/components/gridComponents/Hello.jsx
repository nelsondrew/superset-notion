import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { styled, t } from '@superset-ui/core';
import { DragDroppable } from '../dnd/DragDroppable';
import { CHART_TYPE, PORTABLE_CHART_TYPE } from '../../util/componentTypes';
import BlockNoteEditor from "../../../../packages/blocknote-editor/index"
import DeleteComponentButton from '../DeleteComponentButton';

const HelloDiv = styled.div`
  padding: 16px;
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
  const { editMode } = props;
  const [isEditorFocused, setIsEditorFocused] = useState(false);

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

  const handleHover = (hoverProps, monitor) => {
    // Make sure we have a monitor
    if (!monitor) return;
    
    if (!monitor.isOver()) return;
    
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) return;

    // Only handle hover for chart types
    const itemType = monitor.getItem()?.type;
    if (itemType !== CHART_TYPE) return;

    // Find all chart elements in the editor
    const chartElements = document.querySelectorAll('.portable-chart-component');
    
    chartElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isOverChart = (
        clientOffset.x >= rect.left &&
        clientOffset.x <= rect.right &&
        clientOffset.y >= rect.top &&
        clientOffset.y <= rect.bottom
      );
      
      // Add or remove drag-over class based on hover position
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

    console.log("Drop triggered in Hello", dropResult);
    const { component } = props;

    // Get drop coordinates from monitor
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) {
      console.log('No client offset found');
      return;
    }

    // Find all chart elements in the editor
    const chartElements = document.querySelectorAll('.portable-chart-component');
    
    // Find the highlighted chart element and emit event
    const highlightedChart = Array.from(chartElements).find(element => {
      const rect = element.getBoundingClientRect();
      return (
        clientOffset.x >= rect.left &&
        clientOffset.x <= rect.right &&
        clientOffset.y >= rect.top &&
        clientOffset.y <= rect.bottom
      );
    });

    if (!highlightedChart) {
      console.log('Drop cancelled - not on chart element');
      return;
    }

    // Emit custom event with dropResult data
    const chartDropEvent = new CustomEvent('chart-drop', {
      detail: {
        dropResult,
        targetElement: highlightedChart
      },
      bubbles: true
    });
    highlightedChart.dispatchEvent(chartDropEvent);

    if (!component.children) {
      component.children = [];
    }
    
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

  const {
    id,
    component,
    parentComponent,
    index,
    depth,
    deleteComponent,
  } = props;

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
        <HelloDiv ref={dragSourceRef}>
          <BlockNoteEditor component={component} />
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