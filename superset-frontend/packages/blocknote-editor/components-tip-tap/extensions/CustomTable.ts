import Table from '@tiptap/extension-table';
import { CustomTableView } from './CustomTableView';

export const CustomTable = Table.extend({
  addOptions() {
    return {
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
      }
    };
  }
}); 