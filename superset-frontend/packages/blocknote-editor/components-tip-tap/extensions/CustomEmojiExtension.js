import { Node } from '@tiptap/core'

export const CustomEmoji = Node.create({
  name: 'customEmoji',
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      name: {
        default: null,
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-type="custom-emoji"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', {
      'data-type': 'custom-emoji',
      class: 'custom-emoji',
      src: HTMLAttributes.src,
      alt: HTMLAttributes.name,
      style: `
        display: inline;
        height: 1.25em;
        width: auto;
        vertical-align: text-bottom;
        object-fit: contain;
      `,
      ...HTMLAttributes,
    }]
  },
}) 