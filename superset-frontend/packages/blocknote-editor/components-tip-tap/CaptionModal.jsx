import React from 'react'
import styled from 'styled-components'
import { useState, useEffect } from 'react'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`

const ModalContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10000;
`

const Title = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$primary ? `
    background: #3b82f6;
    color: white;
    border: none;

    &:hover {
      background: #2563eb;
    }
  ` : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;

    &:hover {
      background: #f3f4f6;
    }
  `}
`

const WidthOptions = styled.div`
  margin-bottom: 1rem;
`

const Label = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
`

const WidthButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`

const WidthButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: ${props => props.$active ? '#f3f4f6' : 'white'};
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

export const CaptionModal = ({ isOpen, onClose, onSave, initialCaption = '', chartAlignment = 'center', initialWidth = '20%' }) => {
  const [caption, setCaption] = useState(initialCaption)
  const [width, setWidth] = useState(initialWidth)
  const isSideCaption = chartAlignment === 'left' || chartAlignment === 'right'

  useEffect(() => {
    if (isOpen) {
      setCaption(initialCaption)
      setWidth(initialWidth)
    }
  }, [isOpen, initialCaption, initialWidth])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      caption: caption || '', // Remove the trim() to preserve whitespace
      width: isSideCaption ? width : '100%'
    })
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  const handleCaptionChange = (e) => {
    // Preserve all whitespace including newlines
    setCaption(e.target.value)
  }

  return (
    <Overlay onClick={handleClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Title>Add Caption</Title>
        <form onSubmit={handleSubmit}>
          <TextArea
            placeholder="Enter caption..."
            value={caption}
            onChange={handleCaptionChange}
            autoFocus
            spellCheck="true"
            wrap="soft"
            style={{ whiteSpace: 'pre-wrap' }} // Preserve whitespace and line breaks
          />
          {isSideCaption && (
            <WidthOptions>
              <Label>Caption Width</Label>
              <WidthButtonGroup>
                <WidthButton
                  type="button"
                  $active={width === '20%'}
                  onClick={() => setWidth('20%')}
                >
                  Narrow
                </WidthButton>
                <WidthButton
                  type="button"
                  $active={width === '40%'}
                  onClick={() => setWidth('40%')}
                >
                  Medium
                </WidthButton>
                <WidthButton
                  type="button"
                  $active={width === '70%'}
                  onClick={() => setWidth('70%')}
                >
                  Wide
                </WidthButton>
              </WidthButtonGroup>
            </WidthOptions>
          )}
          <ButtonGroup>
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" $primary>
              Save
            </Button>
          </ButtonGroup>
        </form>
      </ModalContainer>
    </Overlay>
  )
} 