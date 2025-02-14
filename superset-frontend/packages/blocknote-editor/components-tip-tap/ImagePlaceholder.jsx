import React from 'react'
import { useState, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import styled from 'styled-components'

const PlaceholderContainer = styled.div`
  min-height: 48px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 1rem 0;
  padding: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #94a3b8;
    background-color: #f8fafc;
  }
`

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.875rem;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #475569;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #1e293b;
  }
`

const TabContainer = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: 20px;
`

const Tab = styled.button`
  flex: 1;
  padding: 8px;
  background: ${props => props.active ? '#f1f5f9' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? '#1e293b' : '#64748b'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #1e293b;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`

const Button = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`

export const ImagePlaceholder = ({ node, deleteNode }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleUpload = useCallback(async () => {
    const onImageAdd = node.attrs.onImageAdd
    if (!onImageAdd || isLoading) return

    try {
      setIsLoading(true)
      if (activeTab === 'upload' && file) {
        await onImageAdd(file)
        setFile(null)
      } else if (activeTab === 'embed' && imageUrl) {
        await onImageAdd(imageUrl)
        setImageUrl('')
      }
      setShowModal(false)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error.message || 'Failed to upload image')
    } finally {
      setIsLoading(false)
    }
  }, [node.attrs.onImageAdd, activeTab, file, imageUrl, isLoading])

  const closeModal = useCallback(() => {
    if (!isLoading) {
      setShowModal(false)
      setFile(null)
      setImageUrl('')
    }
  }, [isLoading])

  if (!isMounted) {
    return null
  }

  return (
    <NodeViewWrapper>
      <PlaceholderContainer onClick={() => !isLoading && setShowModal(true)}>
        <UploadButton disabled={isLoading}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          {isLoading ? 'Uploading...' : 'Add image'}
        </UploadButton>
      </PlaceholderContainer>

      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>Add image</h3>
            </ModalHeader>

            <TabContainer>
              <Tab 
                active={activeTab === 'upload'} 
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </Tab>
              <Tab 
                active={activeTab === 'embed'} 
                onClick={() => setActiveTab('embed')}
              >
                Embed
              </Tab>
            </TabContainer>

            {activeTab === 'upload' ? (
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            ) : (
              <Input
                type="text"
                placeholder="Paste the image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            )}

            <Button 
              onClick={handleUpload}
              disabled={isLoading || (activeTab === 'upload' && !file) || (activeTab === 'embed' && !imageUrl)}
            >
              {isLoading ? 'Uploading...' : 'Add image'}
            </Button>
          </Modal>
        </ModalOverlay>
      )}
    </NodeViewWrapper>
  )
} 