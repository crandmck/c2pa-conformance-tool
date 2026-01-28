import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import FileUpload from './FileUpload.svelte'

describe('FileUpload Component', () => {
  describe('compact mode', () => {
    it('should render a browse button in compact mode', () => {
      const { getByText } = render(FileUpload, { props: { compact: true } })

      const button = getByText('📁 Browse Files')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('should trigger file input click when button is clicked', async () => {
      const { getByText, container } = render(FileUpload, { props: { compact: true } })

      const button = getByText('📁 Browse Files')
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

      const clickSpy = vi.spyOn(fileInput, 'click')

      await fireEvent.click(button)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should dispatch fileselect event when file is selected', async () => {
      const { component, container } = render(FileUpload, { props: { compact: true } })

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      const eventHandler = vi.fn()
      component.$on('fileselect', eventHandler)

      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false
      })

      await fireEvent.change(fileInput)

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: mockFile
        })
      )
    })
  })

  describe('full mode', () => {
    it('should render drop zone in full mode', () => {
      const { getByText, getByRole } = render(FileUpload, { props: { compact: false } })

      expect(getByText('Drop a file here or click to select')).toBeInTheDocument()
      expect(getByRole('button')).toBeInTheDocument()
    })

    it('should highlight drop zone on drag over', async () => {
      const { getByRole } = render(FileUpload, { props: { compact: false } })

      const dropZone = getByRole('button')

      await fireEvent.dragOver(dropZone, {
        dataTransfer: { files: [] }
      })

      expect(dropZone.className).toContain('border-blue-500')
      expect(dropZone.className).toContain('bg-blue-50')
    })

    it('should remove highlight on drag leave', async () => {
      const { getByRole, container } = render(FileUpload, { props: { compact: false } })

      const dropZone = getByRole('button')

      await fireEvent.dragOver(dropZone, {
        dataTransfer: { files: [] }
      })
      expect(dropZone.className).toContain('border-blue-500')

      await fireEvent.dragLeave(dropZone)

      // Wait a tick for state to update
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(dropZone.className).toContain('border-gray-300')
    })

    it('should dispatch fileselect event on file drop', async () => {
      const { component, getByRole } = render(FileUpload, { props: { compact: false } })

      const dropZone = getByRole('button')
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      const eventHandler = vi.fn()
      component.$on('fileselect', eventHandler)

      await fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile]
        }
      })

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: mockFile
        })
      )
    })

    it('should trigger file input on click', async () => {
      const { getByRole, container } = render(FileUpload, { props: { compact: false } })

      const dropZone = getByRole('button')
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

      const clickSpy = vi.spyOn(fileInput, 'click')

      await fireEvent.click(dropZone)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should trigger file input on Enter key press', async () => {
      const { getByRole, container } = render(FileUpload, { props: { compact: false } })

      const dropZone = getByRole('button')
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

      const clickSpy = vi.spyOn(fileInput, 'click')

      await fireEvent.keyDown(dropZone, { key: 'Enter' })

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should not trigger file input on other key presses', async () => {
      const { getByRole, container } = render(FileUpload, { props: { compact: false } })

      const dropZone = getByRole('button')
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

      const clickSpy = vi.spyOn(fileInput, 'click')

      await fireEvent.keyDown(dropZone, { key: 'Space' })

      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('should accept specified file types', () => {
      const { container } = render(FileUpload, { props: { compact: false } })

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

      expect(fileInput.accept).toBe('image/*,video/*,audio/*,.pdf')
    })

    it('should handle empty file list on drop', async () => {
      const { component, getByRole } = render(FileUpload, { props: { compact: false } })

      const dropZone = getByRole('button')

      const eventHandler = vi.fn()
      component.$on('fileselect', eventHandler)

      await fireEvent.drop(dropZone, {
        dataTransfer: {
          files: []
        }
      })

      expect(eventHandler).not.toHaveBeenCalled()
    })
  })
})
