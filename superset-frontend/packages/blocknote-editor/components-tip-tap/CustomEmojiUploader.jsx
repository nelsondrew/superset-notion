import React from 'react'
import { useState } from 'react'
import styled from 'styled-components'
import { customEmojiStorage } from '../utils/customEmojiStorage'

const UploaderContainer = styled.div`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin: 1rem 0;
`

const Form = styled.form`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`

const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // Set to emoji-appropriate size (32x32 pixels)
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')
      
      // Use better quality scaling
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, 32, 32)
      
      // Convert to WebP for better quality/size ratio
      canvas.toBlob((blob) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }, 'image/webp', 0.9)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export const CustomEmojiUploader = ({ onEmojiAdded }) => {
  const [name, setName] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      try {
        const resizedImage = await resizeImage(file)
        setImage(resizedImage)
        setPreview(resizedImage) // Show preview
      } catch (error) {
        console.error('Error processing image:', error)
        alert('Failed to process image')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !image) return

    setLoading(true)
    try {
      const newEmoji = {
        name: name.toLowerCase(),
        emoji: image,
        isCustom: true
      }

      const updated = customEmojiStorage.add(newEmoji)
      if (onEmojiAdded) {
        onEmojiAdded(updated)
      }

      // Reset form
      setName('')
      setImage(null)
      setPreview(null)
      e.target.reset()
    } catch (error) {
      console.error('Error adding custom emoji:', error)
      alert('Failed to add custom emoji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <UploaderContainer>
      <h3>Add Custom Emoji</h3>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Emoji name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        {preview && (
          <PreviewContainer>
            <PreviewImage src={preview} alt="Emoji preview" />
          </PreviewContainer>
        )}
        <Button type="submit" disabled={loading || !name || !image}>
          {loading ? 'Adding...' : 'Add Emoji'}
        </Button>
      </Form>
    </UploaderContainer>
  )
}

const PreviewContainer = styled.div`
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
` 