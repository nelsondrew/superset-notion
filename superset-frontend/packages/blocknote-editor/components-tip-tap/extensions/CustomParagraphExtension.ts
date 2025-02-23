import { Paragraph } from '@tiptap/extension-paragraph';
import { v4 as uuidv4 } from 'uuid';
import { Plugin } from 'prosemirror-state';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

export const CustomParagraphExtension = Paragraph.extend({
  name: 'paragraph',

  addAttributes() {
    return {
      decorated: {
        default: false,
        keepOnSplit: false, // Don't inherit on split
        parseHTML: element => {
          return element.hasAttribute('data-decorated');
        },
        renderHTML: attributes => {
          if (!attributes.decorated) {
            return {};
          }
          return { 'data-decorated': 'true' };
        },
      },
      id: {
        default: () => uuidv4(), // Generate new ID for each node
        keepOnSplit: false, // Don't inherit on split
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => {
          return { id: attributes.id };
        }
      },
      'data-text-color': {
        default: () => 'Default',
        keepOnSplit: false, // Don't inherit on split
        parseHTML: element => element.getAttribute('data-text-color') || null,
        renderHTML: attributes => {
          if (!attributes['data-text-color']) {
            return {};
          }
          return { 'data-text-color': attributes['data-text-color'] };
        }
      },
      'data-bg-color': {
        default: () => 'Default',
        keepOnSplit: false, // Don't inherit on split
        parseHTML: element => element.getAttribute('data-bg-color') || null,
        renderHTML: attributes => {
          if (!attributes['data-bg-color']) {
            return {};
          }
          return { 'data-bg-color': attributes['data-bg-color'] };
        }
      }
    };
  },

  // Add parseHTML to ensure attributes are properly parsed from HTML
  parseHTML() {
    return [
      {
        tag: 'p',
        getAttrs: dom => {
          if (typeof dom === 'string') return {};
          const element = dom as HTMLElement;
          return {
            id: element.getAttribute('id'),
            decorated: element.hasAttribute('data-decorated'),
            'data-text-color': element.getAttribute('data-text-color') || null,
            'data-bg-color': element.getAttribute('data-bg-color') || null,
          };
        },
      },
    ];
  },

  // Add renderHTML to ensure attributes are properly rendered to HTML
  renderHTML({ HTMLAttributes }) {
    return ['p', HTMLAttributes, 0];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (
          transactions: readonly Transaction[],
          oldState: EditorState,
          newState: EditorState
        ) => {
          // Only proceed if there are new nodes
          const hasNewNodes = transactions.some(tr => tr.docChanged);
          if (!hasNewNodes) return null;

          const tr = newState.tr;
          let modified = false;

          // Reset color attributes for new nodes
          newState.doc.descendants((node: ProseMirrorNode, pos: number) => {
            if (node.type.name === 'paragraph') {
              const oldNode = oldState.doc.nodeAt(pos);
              if (!oldNode) {
                // This is a new node, ensure it has default attributes
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  'data-text-color': 'Default',
                  'data-bg-color': 'Default',
                  decorated: false,
                  id: uuidv4()
                });
                modified = true;
              }
            }
          });

          return modified ? tr : null;
        }
      })
    ];
  }
}); 