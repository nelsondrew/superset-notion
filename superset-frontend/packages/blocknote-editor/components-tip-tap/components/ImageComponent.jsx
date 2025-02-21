import React, { useState, useEffect, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import styled from 'styled-components'
import { Resizable } from 're-resizable'
import { Image as ImageIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

const ImageContainer = styled.div`
  position: relative;
  margin: 1em 0;
  width: ${props => props.widthPercentage}%;
  margin-left: ${props => {
    switch(props.alignment) {
      case 'left': return '0';
      case 'center': return 'auto';
      case 'right': return 'auto';
      default: return '0';
    }
  }};
  margin-right: ${props => {
    switch(props.alignment) {
      case 'left': return 'auto';
      case 'center': return 'auto';
      case 'right': return '0';
      default: return 'auto';
    }
  }};
`

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #f8fafc;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const AddImageContainer = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`

const AddImageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  
  svg {
    width: 24px;
    height: 24px;
    color: #64748b;
  }
  
  span {
    font-size: 16px;
    color: #64748b;
  }
`

const AddImageInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid transparent;
  outline: none;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    border-color: #2563eb;
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`

const AlignmentControls = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 4px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;

  ${ImageContainer}:hover & {
    opacity: 1;
  }
`

const AlignmentButton = styled.button`
  padding: 6px;
  background: ${props => props.active ? '#e2e8f0' : 'transparent'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f1f5f9;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

export const ImageComponent = ({ node, updateAttributes, editor }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const containerRef = useRef(null)
  const alignment = node.attrs.alignment || 'left'
  const widthPercentage = node.attrs.widthPercentage || 50

  // Calculate actual dimensions based on container width and percentage
  const calculateDimensions = (containerWidth, aspectRatio, percentage) => {
    const width = (containerWidth * percentage) / 100
    const height = width / aspectRatio
    return { width, height }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (url) {
      try {
        const loadImage = new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve({ width: img.width, height: img.height })
          img.onerror = () => reject(new Error('Failed to load image'))
          img.src = url
        })

        const { width, height } = await loadImage
        const aspectRatio = width / height
        
        const containerWidth = containerRef.current.parentElement.offsetWidth
        const { width: initialWidth, height: initialHeight } = calculateDimensions(
          containerWidth,
          aspectRatio,
          50
        )

        updateAttributes({
          src: url,
          widthPercentage: 50, 
          aspectRatio,
          alignment: 'left'
        })
        setUrl('')
        setError('')
      } catch (err) {
        setError('Invalid image URL')
      }
    }
  }

  const handleResize = (e, direction, ref) => {
    const containerWidth = ref.parentElement.offsetWidth
    const newWidthPercentage = (ref.offsetWidth / containerWidth) * 100
    
    updateAttributes({
      widthPercentage: Math.round(newWidthPercentage)
    })
  }

  // Update dimensions on window resize
  useEffect(() => {
    if (!node.attrs.src || !containerRef.current) return

    const updateImageSize = () => {
      const containerWidth = containerRef.current.parentElement.offsetWidth
      const { width, height } = calculateDimensions(
        containerWidth,
        node.attrs.aspectRatio,
        node.attrs.widthPercentage
      )
      
      containerRef.current.style.width = `${width}px`
      const img = containerRef.current.querySelector('img')
      if (img) {
        img.style.height = `${height}px`
      }
    }

    window.addEventListener('resize', updateImageSize)
    updateImageSize() // Initial calculation

    return () => window.removeEventListener('resize', updateImageSize)
  }, [node.attrs.src, node.attrs.aspectRatio, node.attrs.widthPercentage])

  return (
    <NodeViewWrapper>
      <ImageContainer 
        ref={containerRef}
        alignment={alignment}
        widthPercentage={widthPercentage}
      >
        {node.attrs.src ? (
          <>
            {editor?.isEditable && (
              <AlignmentControls>
                <AlignmentButton 
                  onClick={() => updateAttributes({ alignment: 'left' })}
                  active={alignment === 'left'}
                  title="Align left"
                >
                  <AlignLeft />
                </AlignmentButton>
                <AlignmentButton 
                  onClick={() => updateAttributes({ alignment: 'center' })}
                  active={alignment === 'center'}
                  title="Align center"
                >
                  <AlignCenter />
                </AlignmentButton>
                <AlignmentButton 
                  onClick={() => updateAttributes({ alignment: 'right' })}
                  active={alignment === 'right'}
                  title="Align right"
                >
                  <AlignRight />
                </AlignmentButton>
              </AlignmentControls>
            )}
            <Resizable
              onResizeStop={handleResize}
              lockAspectRatio={true}
            >
              <ImageWrapper>
                <img 
                  src={node.attrs.src}
                  alt=""
                  loading="lazy"
                />
              </ImageWrapper>
            </Resizable>
          </>
        ) : (
          <AddImageContainer>
            <AddImageHeader>
              <ImageIcon size={24} />
              <span>Add image</span>
            </AddImageHeader>
            <form onSubmit={handleSubmit}>
              <AddImageInput
                type="url"
                placeholder="Enter image URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {error && (
                <div style={{ color: '#ef4444', fontSize: '12px', padding: '4px 16px' }}>
                  {error}
                </div>
              )}
            </form>
          </AddImageContainer>
        )}
      </ImageContainer>
    </NodeViewWrapper>
  )
}