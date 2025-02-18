import styled from 'styled-components'
import { useState, useEffect, useRef } from 'react'
import { X, Reply, ThumbsUp } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { EmojiPopover } from './EmojiPopover'
import { createPortal } from 'react-dom'

const ThreadContainer = styled.div`
  position: absolute;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`

const ThreadHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  
  &:hover {
    background: #f5f5f5;
    color: #111;
  }
`

const Comment = styled.div`
  padding: 16px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 12px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const UserInfo = styled.div`
  flex: 1;
`

const UserName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #111;
`

const TimeStamp = styled.div`
  font-size: 12px;
  color: #666;
`

const CommentText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin-left: 44px;
`

const CommentActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  margin-left: 44px;
`

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #f5f5f5;
    color: #111;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`

const CommentInput = styled.div`
  padding: 16px;
  border-top: 1px solid #eee;
`

const InputContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`

const Input = styled.textarea`
  width: 100%;
  padding: 12px;
  border: none;
  font-size: 14px;
  resize: none;
  min-height: 60px;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #999;
  }
`

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-top: 1px solid #eee;
  gap: 4px;
`

const ToolButton = styled.button`
  padding: 6px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #f5f5f5;
    color: #111;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const SendButton = styled.button`
  margin-left: auto;
  padding: 6px 16px;
  background: #e2e8f0;
  color: #475569;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const EmojiTriggerWrapper = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
`

export const CommentsThread = ({ 
  comments, 
  editor, 
  activeCommentMark, 
  setActiveCommentMark, 
  onClose,
  anchorEl 
}) => {
  const [newComment, setNewComment] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const threadRef = useRef(null)
  const defaultUser = "John Doe"
  const avatarUrl = "https://ui-avatars.com/api/?name=JD&background=random&color=fff&bold=true&size=128"
  const [portalContainer, setPortalContainer] = useState(null)

  useEffect(() => {
    const updatePosition = () => {
      if (anchorEl && threadRef.current) {
        const anchorRect = anchorEl.getBoundingClientRect()
        const threadRect = threadRef.current.getBoundingClientRect()
        
        setPosition({
          top: anchorRect.bottom + window.scrollY + 8,
          left: anchorRect.left + window.scrollX - (threadRect.width / 2) + (anchorRect.width / 2)
        })
      }
    }

    const handleClickOutside = (event) => {
      if (!threadRef.current?.contains(event.target) && 
          !anchorEl?.contains(event.target)) {
        onClose()
      }
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [anchorEl, onClose])

  useEffect(() => {
    const container = document.querySelector('.popover-portal-container')
    if (container) {
      setPortalContainer(container)
    }
  }, [])

  const handleEmojiSelect = (emoji) => {
    setNewComment(prev => prev + emoji)
  }

  return (
    <ThreadContainer
      ref={threadRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ThreadHeader>
        <Title>Thread</Title>
        <CloseButton onClick={onClose}>
          <X size={18} />
        </CloseButton>
      </ThreadHeader>

      {comments.map(comment => (
        <Comment key={comment.id}>
          <CommentHeader>
            <Avatar>
              <img 
                src={avatarUrl}
                alt="JD" 
              />
            </Avatar>
            <UserInfo>
              <UserName>{defaultUser}</UserName>
              <TimeStamp>{new Date(comment.timestamp).toLocaleString()}</TimeStamp>
            </UserInfo>
          </CommentHeader>
          <CommentText>{comment.text}</CommentText>
          <CommentActions>
            <ActionButton>
              <ThumbsUp /> 2 Likes
            </ActionButton>
            <ActionButton>
              <Reply /> Reply
            </ActionButton>
          </CommentActions>
        </Comment>
      ))}
      
      <CommentInput>
        <InputContainer>
          <Input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Type your comment here"
          />
          <ToolBar>
            <ToolButton title="Bold">
              <strong>B</strong>
            </ToolButton>
            <ToolButton title="Italic">
              <em>I</em>
            </ToolButton>
            <ToolButton title="Strikethrough">
              <span style={{ textDecoration: 'line-through' }}>S</span>
            </ToolButton>
            <ToolButton title="Code">
              <span style={{ fontFamily: 'monospace' }}>{'</>'}</span>
            </ToolButton>
            <ToolButton title="Link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </ToolButton>
            <div style={{ position: 'relative' }}>
              {portalContainer && createPortal(
                <EmojiPopover onEmojiSelect={handleEmojiSelect} />,
                portalContainer
              )}
            </div>
            <SendButton 
              onClick={() => {
                if (newComment.trim()) {
                  const updatedMark = {
                    ...activeCommentMark,
                    comments: [...(activeCommentMark.comments || []), {
                      id: uuidv4(),
                      text: newComment,
                      author: 'John Doe',
                      timestamp: Date.now()
                    }]
                  }
                  
                  editor.chain().focus()
                    .setMark('comment', updatedMark)
                    .run()
                  
                  setActiveCommentMark(updatedMark)
                  setNewComment('')
                }
              }}
              disabled={!newComment.trim()}
            >
              Send
            </SendButton>
          </ToolBar>
        </InputContainer>
      </CommentInput>
    </ThreadContainer>
  )
} 