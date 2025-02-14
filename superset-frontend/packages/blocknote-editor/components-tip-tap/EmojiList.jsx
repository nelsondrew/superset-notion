import React from 'react'
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import styled from 'styled-components'

const EmojiListContainer = styled.div`
  background: white;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`

const EmojiItem = styled.button`
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: ${props => props.$selected ? '#f3f4f6' : 'transparent'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #f3f4f6;
  }

  .emoji {
    font-size: 1.25rem;
    min-width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 1.5rem;
      height: 1.5rem;
      object-fit: contain;
    }
  }

  .name {
    font-size: 0.875rem;
    color: #374151;
  }
`

export const EmojiList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index) => {
    const item = props.items[index]
    if (item) {
      props.command({
        emoji: item.emoji,
        name: item.name,
        isCustom: item.isCustom
      })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const getCurrentItem = () => {
    return props.items[selectedIndex]
  }

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    upHandler,
    downHandler,
    getCurrentItem,
  }), [selectedIndex, props.items])

  useEffect(() => setSelectedIndex(0), [props.items])

  return (
    <EmojiListContainer>
      {props.items.map((item, index) => (
        <EmojiItem
          key={index}
          $selected={index === selectedIndex}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <span className="emoji">
            {item.isCustom ? (
              <img src={item.emoji} alt={item.name} />
            ) : (
              item.emoji
            )}
          </span>
          <span className="name">{item.name}</span>
        </EmojiItem>
      ))}
    </EmojiListContainer>
  )
})

EmojiList.displayName = 'EmojiList' 