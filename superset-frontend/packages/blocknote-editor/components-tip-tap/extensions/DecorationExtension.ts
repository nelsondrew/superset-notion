import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export interface DecorationOptions {
  initialDecorations?: number[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    decoration: {
      /**
       * Add decoration to a node at specified position
       */
      addDecoration: (position: number) => ReturnType;
      /**
       * Remove all decorations
       */
      removeDecorations: () => ReturnType;
      /**
       * Get all currently decorated positions
       */
      getDecorations: () => number[];
    };
  }
}

const decorationPluginKey = new PluginKey('decoration');

export const DecorationExtension = Extension.create<DecorationOptions>({
  name: 'decoration',

  addOptions() {
    return {
      initialDecorations: [],
    };
  },

  addProseMirrorPlugins() {
    // Initialize with provided positions
    let decoratedPositions = new Set<number>(this.options.initialDecorations);

    return [
      new Plugin({
        key: decorationPluginKey,
        state: {
          init(config, instance) {
            // Create initial decorations from provided positions
            const initialDecorations = Array.from(decoratedPositions)
              .map(position => {
                const node = instance.doc.nodeAt(position);
                if (!node) return null;
                return Decoration.node(position, position + node.nodeSize, {
                  style: 'border-top: 2px solid #3b82f6',
                  'data-decorated': 'true'
                });
              })
              .filter((dec): dec is Decoration => dec !== null);

            return DecorationSet.create(instance.doc, initialDecorations);
          },
          apply(tr, oldSet) {
            // Map all decorated positions through the transaction
            if (tr.docChanged) {
              const newPositions = new Set<number>();
              decoratedPositions.forEach(oldPos => {
                const newPos = tr.mapping.map(oldPos);
                if (newPos !== undefined && tr.doc.nodeAt(newPos)) {
                  newPositions.add(newPos);
                }
              });
              decoratedPositions = newPositions;
            }

            // Handle adding new decorations
            const meta = tr.getMeta(decorationPluginKey);
            if (meta?.type === 'addDecoration') {
              const { pos } = meta;
              try {
                const node = tr.doc.nodeAt(pos);
                if (!node) return oldSet;
                decoratedPositions.add(pos);
              } catch (error) {
                console.error('Error adding decoration:', error);
              }
            }

            // Handle removing all decorations
            if (meta?.type === 'removeDecorations') {
              decoratedPositions.clear();
              return DecorationSet.empty;
            }

            // Create decorations for all tracked positions
            try {
              const decorations = Array.from(decoratedPositions)
                .map(position => {
                  const node = tr.doc.nodeAt(position);
                  if (!node) return null;

                  return Decoration.node(position, position + node.nodeSize, {
                    style: 'border-top: 2px solid #3b82f6',
                    'data-decorated': 'true'
                  });
                })
                .filter((dec): dec is Decoration => dec !== null);

              return DecorationSet.create(tr.doc, decorations);
            } catch (error) {
              console.error('Error creating decorations:', error);
              return oldSet;
            }
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      addDecoration:
        (position: number) =>
        ({ tr, dispatch, state }) => {
          if (dispatch) {
            if (position >= 0 && position <= state.doc.content.size) {
              tr.setMeta(decorationPluginKey, {
                type: 'addDecoration',
                pos: position,
              });
              dispatch(tr);
              return true;
            }
          }
          return false;
        },
      removeDecorations:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(decorationPluginKey, {
              type: 'removeDecorations',
            });
            dispatch(tr);
            return true;
          }
          return false;
        },
      getDecorations:
        () =>
        ({ state }) => {
          const plugin = state.plugins.find(p => p.key === decorationPluginKey);
          if (!plugin) return [];
          
          const decorationSet = plugin.getState(state);
          if (!decorationSet) return [];

          return Array.from(decorationSet.find())
            .map(decoration => decoration.from)
            .filter((pos): pos is number => pos !== undefined);
        },
    };
  },
}); 