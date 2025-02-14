import React from 'react'
import { BubbleMenu } from '@tiptap/react'
import styled from 'styled-components'

const MenuContainer = styled.div`
  display: flex;
  gap: 2px;
  background: #1a1a1a;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
`

const MenuButton = styled.button`
  padding: 6px 10px;
  background: ${props => props.active ? '#404040' : '#2d2d2d'};
  border: 1px solid #404040;
  border-radius: 4px;
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #404040;
    border-color: #525252;
    color: #ffffff;
  }

  &:active {
    background: #525252;
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
  }
`

export const ChartMenu = ({ editor }) => {
  const setAlignment = (alignment) => {
    const { state } = editor
    const { from, to } = state.selection
    
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'chart') {
        editor.chain()
          .focus()
          .setNodeAttribute('chart', 'alignment', alignment)
          .run()
        return false
      }
    })
  }

  const currentAlignment = (() => {
    const node = editor.state.selection.$anchor.node()
    if (node.type.name === 'chart') {
      return node.attrs.alignment || 'center'
    }
    return 'center'
  })()

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => {
        const node = editor.state.selection.$anchor.node()
        return node.type.name === 'chart' || editor.isActive('chart')
      }}
      tippyOptions={{
        placement: 'top-start',
        offset: [0, 12],
        animation: 'scale',
        duration: 150,
        zIndex: 99999,
      }}
    >
      <MenuContainer>
        <MenuButton 
          onClick={() => setAlignment('left')}
          title="Align left"
          active={currentAlignment === 'left'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="15" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </MenuButton>
        <MenuButton 
          onClick={() => setAlignment('center')}
          title="Center"
          active={currentAlignment === 'center'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="6" y1="12" x2="18" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </MenuButton>
        <MenuButton 
          onClick={() => setAlignment('right')}
          title="Align right"
          active={currentAlignment === 'right'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="9" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </MenuButton>
      </MenuContainer>
    </BubbleMenu>
  )
} 