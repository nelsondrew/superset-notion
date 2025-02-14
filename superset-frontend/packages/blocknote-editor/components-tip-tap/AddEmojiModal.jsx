import React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.2s;
  backdrop-filter: blur(4px);
`

const ModalContainer = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 1.2rem;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  transform: scale(${props => props.$isOpen ? '1' : '0.95'});
`

const Title = styled.h2`
  margin: 0 0 2rem 0;
  color: #111827;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const Label = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
  background: #f9fafb;
  color: black;

  &:hover {
    border-color: #d1d5db;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    background: white;
  }

  &::placeholder {
    color: #9ca3af;
  }
`

const FileInput = styled.div`
  position: relative;
  width: 100%;
`

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
  font-size: 1rem;
  font-weight: 500;
  color: #4b5563;

  &:hover {
    border-color: #3b82f6;
    background: #f3f4f6;
    color: #2563eb;
  }

  svg {
    width: 24px;
    height: 24px;
    color: #6b7280;
    transition: color 0.2s;
  }

  &:hover svg {
    color: #2563eb;
  }

  /* Add a subtle text shadow for better visibility */
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
`

const HiddenInput = styled.input`
  display: none;
`

const PreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.75rem;
`

const Preview = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 0.5rem;
  object-fit: contain;
  background: white;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const PreviewText = styled.span`
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;

  ${props => props.$primary ? `
    background: #3b82f6;
    color: white;
    border: none;

    &:hover {
      background: #2563eb;
    }

    &:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
    }
  ` : `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;

    &:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
  `}
`

export const AddEmojiModal = ({ isOpen, onClose, onEmojiAdded }) => {
  const [name, setName] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target.result)
        setPreview(event.target.result)
      }
      reader.readAsDataURL(file)
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

      await onEmojiAdded(newEmoji)
      onClose()
      setName('')
      setImage(null)
      setPreview(null)
    } catch (error) {
      console.error('Error adding emoji:', error)
      alert('Failed to add emoji')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer $isOpen={isOpen} onClick={e => e.stopPropagation()}>
        <Title>Add Custom Emoji</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="emoji-name">Emoji Name</Label>
            <Input
              id="emoji-name"
              type="text"
              placeholder="Enter emoji name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Emoji Image</Label>
            <FileInput>
              <FileInputLabel>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                </svg>
                <span>Choose Image</span>
                <HiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </FileInputLabel>
            </FileInput>
            {preview && (
              <PreviewContainer>
                <Preview src={preview} alt="Preview" />
                <PreviewText>Preview of your emoji</PreviewText>
              </PreviewContainer>
            )}
          </InputGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              $primary
              disabled={loading || !name || !image}
            >
              {loading ? 'Adding...' : 'Add Emoji'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </Overlay>
  )
} 