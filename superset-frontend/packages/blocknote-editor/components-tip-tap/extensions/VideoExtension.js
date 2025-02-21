import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { VideoComponent } from '../components/VideoComponent'

export const VideoExtension = Node.create({
  name: 'video',
  
  group: 'block',
  
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '640px',
      },
      height: {
        default: '480px',
      },
      alignment: {
        default: 'left',
        renderHTML: attributes => {
          return {
            'data-alignment': attributes.alignment,
          }
        },
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'video', ...HTMLAttributes }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent)
  },

  addCommands() {
    return {
      setVideo: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes
        })
      }
    }
  }
}) 