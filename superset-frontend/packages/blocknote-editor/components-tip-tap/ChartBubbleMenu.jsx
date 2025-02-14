'use client'

import { BubbleMenu } from '@tiptap/react'
import styled from 'styled-components'
import { useState } from 'react'
import { CaptionModal } from './CaptionModal'
import { useSelector } from 'react-redux'
import { css, Global } from '@emotion/react'

const MenuContainer = styled.div`
  display: flex;
  background-color: #ffffff;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
  gap: 0.5rem;
  align-items: center;
`

const Button = styled.button`
  padding: 0.4rem 0.6rem;
  border: none;
  background: ${props => props.$active ? '#f3f4f6' : 'transparent'};
  border-radius: 0.375rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
  }
`

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: #e5e7eb;
  margin: 0 0.25rem;
`

const CaptionInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 200px;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

export const ChartBubbleMenu = ({ editor }) => {
  const [showCaptionModal, setShowCaptionModal] = useState(false)
  const currentAlignment = editor.getAttributes('chart').alignment || 'center'
  const editMode = useSelector(state => state?.dashboardState?.editMode);


  const handleSaveCaption = ({ caption, width }) => {
    const captionAlignment = (() => {
      switch (currentAlignment) {
        case 'left': return 'right'
        case 'right': return 'left'
        default: return 'bottom'
      }
    })()

    editor
      .chain()
      .focus()
      .updateAttributes('chart', {
        caption,
        captionAlignment,
        captionWidth: width
      })
      .run()
  }

  const setAlignment = (alignment) => {
    // Determine caption alignment based on new chart alignment
    const captionAlignment = (() => {
      switch (alignment) {
        case 'left': return 'right'
        case 'right': return 'left'
        default: return 'bottom'
      }
    })()

    editor
      .chain()
      .focus()
      .updateAttributes('chart', {
        alignment,
        // Update captionAlignment only if there's a caption
        ...(editor.getAttributes('chart').caption && { captionAlignment })
      })
      .run()
  }

  return (
    <>

      <BubbleMenu
        editor={editor}
        shouldShow={({ editor }) => editMode && editor.isActive('chart') && !showCaptionModal}
        tippyOptions={{
          duration: 100,
          placement: 'top',
          zIndex: 999,
          getReferenceClientRect: () => {
            const chartElement = document.querySelector('.ProseMirror-selectednode[data-type="chart"]')
            if (chartElement) {
              return chartElement.getBoundingClientRect()
            }
            return null
          }
        }}
      >
        <MenuContainer>
          <Button
            onClick={() => setAlignment('left')}
            $active={currentAlignment === 'left'}
            title="Align left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="15" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
          <Button
            onClick={() => setAlignment('center')}
            $active={currentAlignment === 'center'}
            title="Center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
          <Button
            onClick={() => setAlignment('right')}
            $active={currentAlignment === 'right'}
            title="Align right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="9" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>

          <Divider />

          <Button onClick={() => setShowCaptionModal(true)}>
            Add Caption
          </Button>
        </MenuContainer>
      </BubbleMenu>

      <CaptionModal
        isOpen={showCaptionModal}
        onClose={() => setShowCaptionModal(false)}
        onSave={handleSaveCaption}
        initialCaption={editor.getAttributes('chart').caption || ''}
        chartAlignment={currentAlignment}
        initialWidth={editor.getAttributes('chart').captionWidth || '20%'}
      />
    </>
  )
} 