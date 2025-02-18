import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

function convertHtmlToText(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  
  // Replace <br> with newlines
  const brs = div.getElementsByTagName('br')
  for (const br of brs) {
    br.replaceWith('\n')
  }
  
  // Add newlines after block elements
  const blocks = div.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, ul, ol, li')
  for (const block of blocks) {
    block.appendChild(document.createTextNode('\n'))
  }

  // Handle emojis better
  const emojis = div.querySelectorAll('img[data-emoji]')
  for (const emoji of emojis) {
    emoji.replaceWith(emoji.getAttribute('alt') || emoji.getAttribute('data-emoji') || '')
  }
  
  return div.innerText || div.textContent
}

export async function exportToDocx(editor) {
  try {
    // Get HTML content
    const html = editor.getHTML()
    
    // Convert to formatted text
    const text = convertHtmlToText(html)
    
    // Split into paragraphs and clean up extra whitespace
    const paragraphs = text
      .split('\n')
      .map(p => p.trim())
      .filter(p => p)
    
    // Create document with better formatting
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.map(p => new Paragraph({
          children: [
            new TextRun({
              text: p,
              size: 24, // 12pt
              font: 'Arial',
              break: p.length === 0 // Add break for empty paragraphs
            })
          ],
          spacing: {
            before: 240, // 12pt
            after: 240,  // 12pt
            line: 360   // 1.5 line spacing
          }
        }))
      }]
    })

    // Generate blob and save with timestamp
    const blob = await Packer.toBlob(doc)
    const timestamp = new Date().getTime()
    saveAs(blob, `document-${timestamp}.docx`)

  } catch (error) {
    console.error('Export error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}