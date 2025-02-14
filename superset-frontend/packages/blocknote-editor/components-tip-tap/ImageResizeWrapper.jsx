import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: inline-block;
  position: relative;
  
  &:hover .resize-handle {
    opacity: 1;
  }
`

const ResizeHandle = styled.div`
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: white;
  border: 1px solid #4a9eff;
  border-radius: 4px;
  width: 12px;
  height: 12px;
  z-index: 100;
  
  &.top-left { 
    top: -6px;
    left: -6px;
    cursor: nw-resize;
  }
  &.top-right {
    top: -6px;
    right: -6px;
    cursor: ne-resize;
  }
  &.bottom-left {
    bottom: -6px;
    left: -6px;
    cursor: sw-resize;
  }
  &.bottom-right {
    bottom: -6px;
    right: -6px;
    cursor: se-resize;
  }
`

const Image = styled.img`
  display: block;
  max-width: 100%;
  height: auto;
`

export const ImageResizeWrapper = ({ node, updateAttributes, selected }) => {
  const [size, setSize] = useState({ width: node.attrs.width || undefined, height: node.attrs.height || undefined })
  const [resizing, setResizing] = useState(false)
  const [initialSize, setInitialSize] = useState(null)
  const [initialPosition, setInitialPosition] = useState(null)
  const imageRef = useRef(null)

  useEffect(() => {
    if (!size.width && imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current
      const newSize = {
        width: naturalWidth,
        height: naturalHeight,
      }
      setSize(newSize)
      updateAttributes(newSize)
    }
  }, [size.width, updateAttributes])

  const onResize = useCallback((event, corner) => {
    if (!resizing || !initialPosition || !initialSize) return

    event.preventDefault()
    
    const dx = event.pageX - initialPosition.x
    const dy = event.pageY - initialPosition.y
    
    let newWidth = initialSize.width
    let newHeight = initialSize.height

    const ratio = initialSize.width / initialSize.height

    switch (corner) {
      case 'top-left':
        newWidth = Math.max(50, initialSize.width - dx)
        newHeight = newWidth / ratio
        break
      case 'top-right':
        newWidth = Math.max(50, initialSize.width + dx)
        newHeight = newWidth / ratio
        break
      case 'bottom-left':
        newWidth = Math.max(50, initialSize.width - dx)
        newHeight = newWidth / ratio
        break
      case 'bottom-right':
        newWidth = Math.max(50, initialSize.width + dx)
        newHeight = newWidth / ratio
        break
    }

    setSize({ width: Math.round(newWidth), height: Math.round(newHeight) })
  }, [resizing, initialPosition, initialSize])

  const startResize = useCallback((event, corner) => {
    event.preventDefault()
    setResizing(true)
    setInitialSize(size)
    setInitialPosition({ x: event.pageX, y: event.pageY })

    const onMouseMove = (e) => onResize(e, corner)
    const onMouseUp = () => {
      setResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      updateAttributes(size)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [size, onResize, updateAttributes])

  return (
    <NodeViewWrapper className="image-resizer">
      <Wrapper>
        <Image 
          ref={imageRef}
          src={node.attrs.src} 
          alt={node.attrs.alt || ''} 
          width={size.width}
          height={size.height}
          style={{ cursor: resizing ? 'move' : 'default' }}
        />
        {selected && (
          <>
            <ResizeHandle className="resize-handle top-left" onMouseDown={(e) => startResize(e, 'top-left')} />
            <ResizeHandle className="resize-handle top-right" onMouseDown={(e) => startResize(e, 'top-right')} />
            <ResizeHandle className="resize-handle bottom-left" onMouseDown={(e) => startResize(e, 'bottom-left')} />
            <ResizeHandle className="resize-handle bottom-right" onMouseDown={(e) => startResize(e, 'bottom-right')} />
          </>
        )}
      </Wrapper>
    </NodeViewWrapper>
  )
} 