import React from 'react';
import PropTypes from 'prop-types';
import { styled, t } from '@superset-ui/core';
import { DragDroppable } from '../dnd/DragDroppable';
import { CHART_TYPE } from '../../util/componentTypes';
import BlockNoteEdtitor from "../../../../packages/blocknote-editor/index"
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
  const handleDrop = dropResult => {
    const { component } = props;
    
    console.log('Chart Drop Event:', {
      dropResult,
      componentId: component.id,
      componentType: component.type,
      draggedItem: dropResult.dragging,
      destination: dropResult.destination,
    });
    
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
    editMode,
    deleteComponent,
  } = props;

  const childrenArray = component.children || [];
  
  if (childrenArray.length > 0) {
    console.log('Hello Component Children:', {
      componentId: component.id,
      children: childrenArray,
      childrenCount: childrenArray.length,
    });
  }

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
      editMode={editMode}
      droppable
      acceptedChildren={[CHART_TYPE]}
    >
      {({ dropIndicatorProps, dragSourceRef }) => (
        <HelloDiv ref={dragSourceRef}>
          <div>HELLO WORLD (Charts absorbed: {childrenArray.length})</div>
          <BlockNoteEdtitor/>
          {editMode && (
            <DeleteButtonContainer editMode={editMode}>
              <DeleteComponentButton
                onDelete={handleDelete}
                tooltip={t('Remove')}
              />
            </DeleteButtonContainer>
          )}
          {dropIndicatorProps && <div {...dropIndicatorProps} />}
        </HelloDiv>
      )}
    </DragDroppable>
  );
}

Hello.propTypes = propTypes; 