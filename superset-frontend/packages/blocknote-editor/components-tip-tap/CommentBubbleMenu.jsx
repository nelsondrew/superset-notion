import { BubbleMenu } from '@tiptap/react'
import styled from 'styled-components'
import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'

const MenuContainer = styled.div`
  display: flex;
  background-color: #ffffff;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  gap: 0.5rem;
`

const Button = styled.button`
  padding: 0.4rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f3f4f6;
  }
`

export const CommentBubbleMenu = ({ editor, onAddComment }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state, from, to }) => {
        const { selection } = state
        return !selection.empty && !editor.isActive('comment')
      }}
      tippyOptions={{ duration: 100 }}
    >
      <MenuContainer>
        <Button 
          onClick={() => onAddComment(editor.state.selection)}
          title="Add comment"
        >
          <MessageSquarePlus size={16} />
        </Button>
      </MenuContainer>
    </BubbleMenu>
  )
} 