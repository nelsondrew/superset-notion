import { Mark } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'

export const Comment = Mark.create({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'comment-mark',
      },
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {}
          }
          return {
            'data-comment-id': attributes.commentId,
          }
        },
      },
      comments: {
        default: [],
        parseHTML: element => {
          const commentsStr = element.getAttribute('data-comments')
          return commentsStr ? JSON.parse(commentsStr) : []
        },
        renderHTML: attributes => {
          if (!attributes.comments?.length) {
            return {}
          }
          return {
            'data-comments': JSON.stringify(attributes.comments),
          }
        },
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[data-comment-id]`,
        getAttrs: element => ({
          commentId: element.getAttribute('data-comment-id'),
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('comment'),
        props: {
          decorations: (state) => {
            const { doc } = state
            const decorations = []
            
            doc.descendants((node, pos) => {
              const marks = node.marks || []
              const commentMark = marks.find(mark => mark.type.name === 'comment')
              
              if (commentMark && commentMark.attrs.comments?.length > 0) {
                decorations.push(
                  Decoration.inline(pos, pos + node.nodeSize, {
                    class: 'comment-highlight'
                  })
                )
              }
            })
            
            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
}) 