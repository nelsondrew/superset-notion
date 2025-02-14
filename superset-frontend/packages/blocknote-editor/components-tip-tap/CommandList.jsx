import React from 'react'
import { useState, useEffect, useCallback, forwardRef } from 'react'
import styled from 'styled-components'

const CommandListContainer = styled.div`
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

const CommandListContent = styled.div`
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
    
    &:hover {
      background-color: #666;
    }
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

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const Item = styled.button`
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
  transition: all 0.15s ease;

  &:hover {
    background: #2d2d2d;
    color: #fff;
  }
`

const ItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${props => props.selected ? '#4a4a4a' : '#2d2d2d'};
  color: ${props => props.selected ? '#fff' : '#999'};
  font-size: 0.75rem;
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

const Shortcut = styled.div`
  color: #666;
  font-size: 0.75rem;
  font-weight: 500;
`

export default forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const flatItems = props.items.reduce((acc, group) => [...acc, ...group.children], [])

  const selectItem = useCallback((index) => {
    const item = flatItems[index]
    if (item) {
      props.command(item)
    }
  }, [flatItems, props])

  const upHandler = useCallback(() => {
    setSelectedIndex(prevIndex => {
      const newIndex = prevIndex - 1
      return newIndex < 0 ? flatItems.length - 1 : newIndex
    })
  }, [flatItems.length])

  const downHandler = useCallback(() => {
    setSelectedIndex(prevIndex => {
      const newIndex = prevIndex + 1
      return newIndex >= flatItems.length ? 0 : newIndex
    })
  }, [flatItems.length])

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex)
  }, [selectItem, selectedIndex])

  const onKeyDown = useCallback((event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      upHandler()
      return true
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      downHandler()
      return true
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      enterHandler()
      return true
    }

    return false
  }, [upHandler, downHandler, enterHandler])

  // Expose methods to parent through props callback
  useEffect(() => {
    if (props.onRef) {
      props.onRef({
        onKeyDown
      })
    }
  }, [props.onRef, onKeyDown])

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  return (
    <CommandListContainer>
      <CommandListContent>
        {props.items.map((group, groupIndex) => (
          <Group key={groupIndex}>
            {group.title && <GroupTitle>{group.title}</GroupTitle>}
            <Items>
              {group.children.map((item, childIndex) => {
                const index = props.items
                  .slice(0, groupIndex)
                  .reduce((acc, g) => acc + g.children.length, 0) + childIndex
                
                const isSelected = index === selectedIndex

                return (
                  <Item
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
                    {item.shortcut && <Shortcut>{item.shortcut}</Shortcut>}
                  </Item>
                )
              })}
            </Items>
          </Group>
        ))}
      </CommandListContent>
    </CommandListContainer>
  )
}) 