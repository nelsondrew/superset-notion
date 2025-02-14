import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImagePlaceholder } from '../ImagePlaceholder'

export const ImagePlaceholderExtension = Node.create({
  name: 'imagePlaceholder',

  group: 'block',

  atom: true,

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      onImageAdd: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => null,
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-placeholder"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'image-placeholder', ...HTMLAttributes }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImagePlaceholder, {
      as: 'div',
      className: 'image-placeholder-wrapper',
      enableReactiveProperties: true,
    })
  },
}) 