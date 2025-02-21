import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import styled from 'styled-components'
import { Resizable } from 're-resizable'
import { Film, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

const VideoContainer = styled.div`
  position: relative;
  margin: 1em 0;
  width: 50%;
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

const VideoWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`

const AddVideoContainer = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`

const AddVideoHeader = styled.div`
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

const AddVideoInput = styled.input`
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

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const Placeholder = styled.div`
  width: 100%;
  min-height: 225px;
  background: #1e1e1e;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #fff;
`

const VideoIcon = styled.div`
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
  opacity: 0.8;
  
  svg {
    width: 100%;
    height: 100%;
  }
`

const ResizeControls = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`

const Input = styled.input`
  width: 80px;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`

const Button = styled.button`
  padding: 8px 16px;
  background: ${props => props.primary ? '#2563eb' : 'transparent'};
  color: ${props => props.primary ? '#fff' : '#94a3b8'};
  border: ${props => props.primary ? 'none' : '1px solid #94a3b8'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.primary ? '#1d4ed8' : 'rgba(148, 163, 184, 0.1)'};
  }
`

const ResizeHandle = styled.div`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
  cursor: se-resize;
  opacity: 0;
  transition: opacity 0.2s;

  ${VideoContainer}:hover & {
    opacity: 1;
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

  ${VideoContainer}:hover & {
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

const getYouTubeEmbedUrl = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = match && match[2].length === 11 ? match[2] : null
  
  if (videoId) {
    // Use YouTube's most permissive embed URL format
    return `https://www.youtube.com/embed/${videoId}?origin=${encodeURIComponent(window.location.origin)}&enablejsapi=0&widgetid=1&controls=1`
  }
  return url
}

export const VideoComponent = ({ node, updateAttributes, editor }) => {
  const [url, setUrl] = useState('')
  const embedUrl = node.attrs.src ? getYouTubeEmbedUrl(node.attrs.src) : null
  const alignment = node.attrs.alignment || 'left'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url) {
      updateAttributes({ 
        src: url,
        width: '640px',
        height: '480px',
        alignment: 'left' // default alignment
      })
      setUrl('')
    }
  }

  const setAlignment = (newAlignment) => {
    updateAttributes({ alignment: newAlignment })
  }

  return (
    <NodeViewWrapper>
      <VideoContainer alignment={alignment}>
        {embedUrl ? (
          <>
            {editor?.isEditable && (
              <AlignmentControls>
                <AlignmentButton 
                  onClick={() => setAlignment('left')}
                  active={alignment === 'left'}
                  title="Align left"
                >
                  <AlignLeft />
                </AlignmentButton>
                <AlignmentButton 
                  onClick={() => setAlignment('center')}
                  active={alignment === 'center'}
                  title="Align center"
                >
                  <AlignCenter />
                </AlignmentButton>
                <AlignmentButton 
                  onClick={() => setAlignment('right')}
                  active={alignment === 'right'}
                  title="Align right"
                >
                  <AlignRight />
                </AlignmentButton>
              </AlignmentControls>
            )}
            <Resizable
              size={{
                width: node.attrs.width,
                height: node.attrs.height,
              }}
              onResizeStop={(e, direction, ref, d) => {
                updateAttributes({
                  width: ref.style.width,
                  height: ref.style.height
                })
              }}
              lockAspectRatio={true}
            >
              <VideoWrapper>
                <iframe
                  src={embedUrl}
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="origin"
                  loading="lazy"
                  title="YouTube video player"
                />
              </VideoWrapper>
            </Resizable>
          </>
        ) : (
          <AddVideoContainer>
            <AddVideoHeader>
              <Film size={24} />
              <span>Add video</span>
            </AddVideoHeader>
            <form onSubmit={handleSubmit}>
              <AddVideoInput
                type="url"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </form>
          </AddVideoContainer>
        )}
      </VideoContainer>
    </NodeViewWrapper>
  )
} 