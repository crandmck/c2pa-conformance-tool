import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { processFile, getVersion } from './c2pa'

// Mock the @contentauth/c2pa-web module
vi.mock('@contentauth/c2pa-web', () => ({
  createC2pa: vi.fn(() => Promise.resolve({
    reader: {
      fromBlob: vi.fn(() => Promise.resolve({
        manifestStore: vi.fn(() => Promise.resolve({
          activeManifest: {
            title: 'Test Manifest',
            format: 'image/jpeg',
            instanceId: 'test-instance-id'
          },
          validationStatus: [{
            code: 'signingCredential.trusted',
            url: 'test.jpg',
            explanation: 'Signing certificate is trusted'
          }]
        })),
        free: vi.fn()
      }))
    }
  }))
}))

describe('c2pa utilities', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.clearAllMocks()

    // Mock successful trust list fetch
    global.fetch = vi.fn((url: string) => {
      const trustListContent = '-----BEGIN CERTIFICATE-----\nMockCertificate\n-----END CERTIFICATE-----'
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(trustListContent)
      } as Response)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getVersion', () => {
    it('should return the SDK version', async () => {
      const version = await getVersion()
      expect(version).toBe('@contentauth/c2pa-web v0.5.6')
    })
  })

  describe('processFile', () => {
    it('should process a file and return manifest store', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      const result = await processFile(mockFile)

      expect(result).toBeDefined()
      expect(result.activeManifest).toBeDefined()
      expect(result.activeManifest.title).toBe('Test Manifest')
    })

    it('should include test certificates when provided', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const testCert = '-----BEGIN CERTIFICATE-----\nTestCert\n-----END CERTIFICATE-----'

      const result = await processFile(mockFile, [testCert])

      expect(result).toBeDefined()
      expect(result.activeManifest).toBeDefined()
    })

    it('should handle different file types', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })

      const result = await processFile(mockFile)

      expect(result).toBeDefined()
      expect(result.activeManifest).toBeDefined()
    })
  })
})
