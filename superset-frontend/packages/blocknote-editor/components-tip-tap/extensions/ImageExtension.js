import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageComponent } from '../components/ImageComponent'

export const ImageExtension = Node.create({
  name: 'customImage',
  
  group: 'block',
  
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 'auto',
      },
      height: {
        default: 'auto',
      },
      aspectRatio: {
        default: null,
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
        tag: 'div[data-type="custom-image"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'custom-image', ...HTMLAttributes }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent)
  },

  addCommands() {
    return {
      setImage: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes
        })
      }
    }
  }
}) 