import React, { forwardRef, useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { getSuggestionItems } from './extensions/SlashCommand'

const MenuContainer = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  color: #fff;
  overflow: hidden;
  padding: 6px;
  width: 320px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
`

const MenuContent = styled.div`
  overflow-y: auto;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4a4a4a;
    border-radius: 4px;
  }
`

const MenuItem = styled.button`
  align-items: center;
  background: ${props => props.selected ? '#2d2d2d' : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${props => props.selected ? '#fff' : '#e1e1e1'};
  cursor: pointer;
  display: flex;
  font-size: 0.875rem;
  gap: 8px;
  padding: 6px 12px;
  text-align: left;
  width: 100%;

  &:hover {
    background: #2d2d2d;
    color: #fff;
  }
`

const Group = styled.div`
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`

const GroupTitle = styled.div`
  color: #666;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const ItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0px;
`

const ItemTitle = styled.div`
  font-weight: 500;
  font-size: 0.813rem;
  line-height: 1.2;
`

const ItemSubtitle = styled.div`
  color: #666;
  font-size: 0.688rem;
  line-height: 1.2;
`

export default forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // Get all items from SlashCommand
  const items = getSuggestionItems({ query: '' })
  const flatItems = items.reduce((acc, group) => [...acc, ...group.children], [])

  const selectItem = useCallback((index) => {
    const item = flatItems[index]
    if (item) {
      // Execute command
      item.command({ 
        editor: props.editor, 
        range: { 
          from: props.position,
          to: props.position 
        }
      })
      // Close popup after command execution
      props.onClose?.()
    }
  }, [props.editor, props.position, flatItems, props.onClose])

  const upHandler = () => {
    setSelectedIndex(i => (i - 1 + flatItems.length) % flatItems.length)
  }

  const downHandler = () => {
    setSelectedIndex(i => (i + 1) % flatItems.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  const onKeyDown = useCallback((event) => {
    if (event.key === 'ArrowUp') {
      upHandler()
      return true
    }
    if (event.key === 'ArrowDown') {
      downHandler()
      return true
    }
    if (event.key === 'Enter') {
      enterHandler()
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (props.onRef) {
      props.onRef({ onKeyDown })
    }
  }, [props.onRef, onKeyDown])

  return (
    <MenuContainer>
      <MenuContent>
        {items.map((group, groupIndex) => (
          <Group key={groupIndex}>
            {group.title && <GroupTitle>{group.title}</GroupTitle>}
            {group.children.map((item, childIndex) => {
              const index = items
                .slice(0, groupIndex)
                .reduce((acc, g) => acc + g.children.length, 0) + childIndex
              
              const isSelected = index === selectedIndex

              return (
                <MenuItem
                  key={index}
                  selected={isSelected}
                  onClick={() => {
                    setSelectedIndex(index)
                    selectItem(index)
                  }}
                >
                  <ItemContent>
                    <ItemTitle>{item.title}</ItemTitle>
                    {item.subtitle && (
                      <ItemSubtitle>{item.subtitle}</ItemSubtitle>
                    )}
                  </ItemContent>
                </MenuItem>
              )
            })}
          </Group>
        ))}
      </MenuContent>
    </MenuContainer>
  )
}) 