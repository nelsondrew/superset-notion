import Table from '@tiptap/extension-table';
import { CustomTableView } from './CustomTableView';

export const CustomTable = Table.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
      resizable: true,
      handleWidth: 5,
      cellMinWidth: 25,
      View: CustomTableView,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      'data-table-type': {
        default: 'normal',
        parseHTML: element => element.getAttribute('data-table-type'),
        renderHTML: attributes => ({
          'data-table-type': attributes['data-table-type']
        })
      },
      'data-table-resizable': {
        default: 'true',
        parseHTML: element => element.getAttribute('data-table-resizable') || 'true',
        renderHTML: attributes => ({
          'data-table-resizable': attributes['data-table-resizable'] || 'true'
        })
      }
    };
  },

  configure(options = {}) {
    return {
      ...this.parent?.().configure(options),
      ...options,
      resizable: true,
      lastColumnResizable: true,
    };
  }
}); 