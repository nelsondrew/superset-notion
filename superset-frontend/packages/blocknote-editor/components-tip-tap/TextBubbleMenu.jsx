import React from 'react'
import { BubbleMenu } from '@tiptap/react'
import styled from 'styled-components'

const MenuContainer = styled.div`
  display: flex;
  background-color: #ffffff;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
  gap: 0.5rem;
  align-items: center;
`

const MenuButton = styled.button`
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Divider = styled.div`
  width: 1px;
  background-color: #e5e7eb;
  margin: 0 0.25rem;
  height: 1.5rem;
`

const SelectWrapper = styled.div`
  position: relative;
  min-width: 80px;

  &::after {
    content: '▼';
    font-size: 0.8em;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }
`

const FontSizeSelect = styled.select`
  appearance: none;
  padding: 0.4rem 1.5rem 0.4rem 0.6rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
  color: #374151;
  width: 100%;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: #d1d5db;
  }
`

export const TextBubbleMenu = ({ editor }) => {
  if (!editor) {
    return null
  }

  const fontSizes = [
    { label: 'Small', value: '12px' },
    { label: 'Normal', value: '16px' },
    { label: 'Medium', value: '18px' },
    { label: 'Large', value: '20px' },
    { label: 'XL', value: '24px' },
    { label: '2XL', value: '28px' },
    { label: '3XL', value: '32px' },
    { label: '4XL', value: '44px'} 
  ]

  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes('textStyle')
    return attrs.fontSize || '16px'
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ 
        duration: 100,
        placement: 'top',
      }}
      shouldShow={({ editor, view, state, oldState, from, to }) => {
        if (from === to) {
          return false
        }

        const isChartSelected = editor.isActive('chart')
        if (isChartSelected) {
          return false
        }

        const isTextSelection = editor.state.doc.textBetween(from, to).length > 0
        return isTextSelection
      }}
    >
      <MenuContainer>
        <SelectWrapper>
          <FontSizeSelect
            value={getCurrentFontSize()}
            onChange={e => {
              editor.chain().focus().setFontSize(e.target.value).run()
            }}
          >
            {fontSizes.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FontSizeSelect>
        </SelectWrapper>

        <Divider />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          $active={editor.isActive('heading', { level: 1 })}
        >
          H1
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          $active={editor.isActive('bold')}
        >
          B
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          $active={editor.isActive('italic')}
        >
          I
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          $active={editor.isActive('strike')}
        >
          S
        </MenuButton>
      </MenuContainer>
    </BubbleMenu>
  )
} 