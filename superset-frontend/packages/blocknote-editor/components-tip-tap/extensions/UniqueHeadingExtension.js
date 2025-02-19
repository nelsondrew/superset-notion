import { Extension } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';
import { Plugin } from 'prosemirror-state';

export const UniqueHeadingExtension = Extension.create({
  name: 'uniqueHeading',


  addProseMirrorPlugins() {
   

    return [
      new Plugin({
        props: {
          handlePaste: (view, event, slice) => {
            // Get the pasted content
            const content = slice.content;
            const newHeadingIds = [];
            
            // Walk through the content and update heading IDs
            content.descendants((node) => {
              if (node.type.name === 'heading') {
                // Generate new ID
                const headerId = `heading-${uuidv4()}`;
                newHeadingIds.push(headerId);
                
                // Modify node attributes directly
                if (node.attrs) {
                  node.attrs.id = headerId;
                } else {
                  node.attrs = { id: headerId, level: node.attrs?.level || 1 };
                }
              }
            });

            // Dispatch custom event with new heading IDs
            if (newHeadingIds.length > 0) {
              const customEvent = new CustomEvent('newHeadingsCreated', {
                detail: { headingIds: newHeadingIds }
              });
              window.dispatchEvent(customEvent);
            }

            return false; // Let other plugins handle the actual paste
          },
        },
      }),
    ];
  },
}); 