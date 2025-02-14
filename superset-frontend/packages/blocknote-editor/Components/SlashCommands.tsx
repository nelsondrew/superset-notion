import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import { tableItem } from './Table';

class MenuList {
  constructor({ items, command }) {
    this.items = items;
    this.command = command;
    this.element = document.createElement('div');
    this.element.className = 'slash-menu';
    this.createItems();
  }

  createItems() {
    this.element.innerHTML = `
      <div class="slash-menu-items">
        ${this.items
          .map(
            item => `
            <button class="slash-menu-item">
              ${item.title}
            </button>
          `,
          )
          .join('')}
      </div>
    `;

    this.element.querySelectorAll('button').forEach((button, index) => {
      button.addEventListener('click', () => {
        this.command(this.items[index]);
      });
    });
  }

  onKeyDown({ event }) {
    if (event.key === 'Enter') {
      this.command(this.items[0]);
      return true;
    }
    return false;
  }

  updateProps(props) {
    this.items = props.items;
    this.command = props.command;
    this.createItems();
  }

  destroy() {
    this.element.remove();
  }
}

export const getSuggestionItems = () => [
  {
    title: 'Custom Component',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent('<div data-type="custom-component"></div>')
        .run();
    },
  },
  tableItem,
];

export const renderItems = () => {
  let component;
  let popup;

  return {
    onStart: props => {
      component = new MenuList({
        items: getSuggestionItems(),
        command: props.command,
      });

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },
    onUpdate: props => {
      component.updateProps({
        items: getSuggestionItems(),
        command: props.command,
      });

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },
    onKeyDown: props => {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return component.onKeyDown(props);
    },
    onExit: () => {
      popup[0].destroy();
      component.destroy();
    },
  };
};

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
}); 