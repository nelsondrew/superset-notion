import { Extension } from '@tiptap/core'
import {  PluginKey } from '@tiptap/pm/state'
import { ReactRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'
import tippy from 'tippy.js'
import { EmojiList } from '../EmojiList'
import { customEmojiStorage } from '../../utils/customEmojiStorage'

// Create a unique plugin key
const suggestionPluginKey = new PluginKey('emojiSuggestion')

const baseEmojiList = [
  { name: 'smile', emoji: '😊' },
  { name: 'laugh', emoji: '😂' },
  { name: 'heart', emoji: '❤️' },
  { name: 'rocket', emoji: '🚀' },
  { name: 'fire', emoji: '🔥' },
  { name: 'thumbsup', emoji: '👍' },
  { name: 'sparkles', emoji: '✨' },
  { name: 'star', emoji: '⭐' },
  { name: 'wave', emoji: '👋' },
  { name: 'ok', emoji: '👌' },
  { name: 'party', emoji: '🎉' },
  { name: 'clap', emoji: '👏' },
  { name: 'cool', emoji: '😎' },
  { name: 'wink', emoji: '😉' },
  { name: 'think', emoji: '🤔' },
  { name: 'love', emoji: '😍' },
  { name: 'sad', emoji: '😢' },
  { name: 'angry', emoji: '😠' },
  { name: 'sunglasses', emoji: '😎' },
  { name: 'pizza', emoji: '🍕' },
  { name: 'coffee', emoji: '☕' },
  { name: 'rainbow', emoji: '🌈' },
  { name: 'moon', emoji: '🌙' },
  { name: 'sun', emoji: '☀️' },
  { name: 'sun', emoji: '☀️' },
  { name : 'messages' , emoji : '💬' },
  { name: 'clock' , emoji : '🕒' }  ,
  // Add more emojis as needed
]

// Function to get combined emoji list
const getFullEmojiList = () => {
  const customEmojis = customEmojiStorage.get()
  return [...baseEmojiList, ...customEmojis]
}

export const EmojiSuggestion = Extension.create({
  name: 'emojiSuggestion',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: suggestionPluginKey,
        editor: this.editor,
        char: ':',
        items: ({ query }) => {
          const fullList = getFullEmojiList()
          return fullList
            .filter(({ name }) => name.toLowerCase().startsWith(query.toLowerCase()))
            // .slice(0, 10)
        },
        command: ({ editor, range, props }) => {
          // First, check if there are multiple spaces before the emoji trigger
          const textBefore = editor.state.doc.textBetween(
            Math.max(0, range.from - 3),
            range.from - 1
          )
          
          // Handle both deletion and insertion in a single chain
          editor
            .chain()
            .focus()
            // If there are multiple spaces before, include them in the deletion range
            .deleteRange({
              from: textBefore.endsWith('  ') ? range.from - 3 : range.from - 1,
              to: range.to
            })
            // Insert a single space if we deleted multiple spaces
            .insertContent(textBefore.endsWith('  ') ? ' ' : '')
            // Insert the emoji
            .insertContent(
              props.isCustom
                ? {
                    type: 'customEmoji',
                    attrs: {
                      src: props.emoji,
                      name: props.name,
                    }
                  }
                : props.emoji
            )
            // Add a zero-width space after emoji
            .insertContent('\u200B')
            .run()
        },
        render: () => {
          let component
          let popup
          let suggestionProps

          return {
            onStart: props => {
              suggestionProps = props
              component = new ReactRenderer(EmojiList, {
                props: {
                  ...props,
                  items: props.items,
                  command: (item) => {
                    props.command(item)
                    popup?.[0].hide()
                  }
                },
                editor: this.editor,
              })

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                zIndex: 9999,
              })
            },
            onUpdate(props) {
              suggestionProps = props
              component?.updateProps({
                ...props,
                items: props.items,
                command: (item) => {
                  props.command(item)
                  popup?.[0].hide()
                }
              })
              popup?.[0].setProps({
                getReferenceClientRect: props.clientRect,
              })
            },
            onKeyDown(props) {
              const { event } = props

              if (event.key === 'Escape') {
                popup?.[0].hide()
                return true
              }

              if (event.key === 'Enter') {
                event.preventDefault()
                const selectedItem = component?.ref?.getCurrentItem()
                if (selectedItem && suggestionProps?.command) {
                  suggestionProps.command(selectedItem)
                  popup?.[0].hide()
                }
                return true
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault()
                component?.ref?.upHandler()
                return true
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault()
                component?.ref?.downHandler()
                return true
              }

              return false
            },
            onExit() {
              popup?.[0].destroy()
              component?.destroy()
            },
          }
        },
      }),
    ]
  },
}) 