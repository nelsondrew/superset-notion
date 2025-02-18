import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

// Create custom table extension
export const ChartTable = Table.extend({
  name: 'chartTable',
  content: 'chartTableRow+',  // Only allow chartTableRow as content

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'chart-table',
        'data-chart-table': 'true'
      },
      resizable: true,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      'data-chart-table': {
        default: 'true',
        parseHTML: element => element.getAttribute('data-chart-table'),
        renderHTML: attributes => {
          return {
            'data-chart-table': attributes['data-chart-table']
          }
        }
      },
      'data-chart-id': {
        default: null,
        parseHTML: element => element.getAttribute('data-chart-id'),
        renderHTML: attributes => {
          return {
            'data-chart-id': attributes['data-chart-id']
          }
        }
      }
    }
  }
})

// Create custom row extension
export const ChartTableRow = TableRow.extend({
  name: 'chartTableRow',
  content: 'chartTableCell+',

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'chart-table-row',
        'data-chart-row': 'true'
      }
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      'data-chart-row': {
        default: 'true',
        parseHTML: element => element.getAttribute('data-chart-row'),
        renderHTML: attributes => {
          return {
            'data-chart-row': attributes['data-chart-row']
          }
        }
      }
    }
  }
})

// Create custom cell extension
export const ChartTableCell = TableCell.extend({
  name: 'chartTableCell',
  content: 'block+',
  
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'chart-table-cell',
        'data-chart-cell': 'true'
      }
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      colspan: {
        default: 1,
        parseHTML: element => element.getAttribute('colspan'),
        renderHTML: attributes => {
          return { colspan: attributes.colspan }
        }
      },
      rowspan: {
        default: 1,
        parseHTML: element => element.getAttribute('rowspan'),
        renderHTML: attributes => {
          return { rowspan: attributes.rowspan }
        }
      },
      'data-chart-cell': {
        default: null,
        parseHTML: element => element.getAttribute('data-chart-cell'),
        renderHTML: attributes => {
          return {
            'data-chart-cell': attributes['data-chart-cell']
          }
        }
      }
    }
  }
})

// Create custom header extension
export const ChartTableHeader = TableHeader.extend({
  name: 'chartTableHeader',
  content: 'block+',
})

// Helper function to insert a chart table
export const insertChartTable = () => (editor) => {
  const chartId = Math.random().toString(36).substr(2, 9);
  
  return editor.chain()
    .focus()
    .insertContent({
      type: 'chartTable',
      attrs: {
        'data-chart-table': 'true',
        'data-chart-id': chartId
      },
      content: [{
        type: 'chartTableRow',
        attrs: {
          'data-chart-row': 'true'
        },
        content: [
          {
            type: 'chartTableCell',
            attrs: {
              colspan: 1,
              rowspan: 1,
              'data-chart-cell': 'left'
            },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Left Column' }] }]
          },
          {
            type: 'chartTableCell',
            attrs: {
              colspan: 1,
              rowspan: 1,
              'data-chart-cell': 'right'
            },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Right Column' }] }]
          }
        ]
      }]
    })
    .run()
}

// Export all extensions together
export const chartTableExtensions = [
  ChartTable,
  ChartTableRow,
  ChartTableCell,
  ChartTableHeader
] 