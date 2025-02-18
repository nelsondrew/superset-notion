import styled from 'styled-components'
import { baseEmojiList } from './extensions/EmojiSuggestion'
import { Smile } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const PopoverContainer = styled.div`
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 300px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 2000;
  padding: 8px;
  pointer-events: auto;
`

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
`

const EmojiButton = styled.button`
  padding: 6px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`

const EmojiTrigger = styled.button`
  padding: 6px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: #f5f5f5;
    color: #111;
  }
`

export const EmojiPopover = ({ onEmojiSelect, triggerRef }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const popoverRef = useRef(null)

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      })
    }
  }, [isOpen, triggerRef])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, triggerRef])

  return (
    <>
      <EmojiTrigger 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Smile size={16} />
      </EmojiTrigger>
      
      {isOpen && (
        <PopoverContainer 
          ref={popoverRef}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
        >
          <EmojiGrid>
            {baseEmojiList.map((emojiObj, index) => (
              <EmojiButton
                key={index}
                onClick={() => {
                  onEmojiSelect(emojiObj.emoji)
                  setIsOpen(false)
                }}
              >
                {emojiObj.emoji}
              </EmojiButton>
            ))}
          </EmojiGrid>
        </PopoverContainer>
      )}
    </>
  )
} 