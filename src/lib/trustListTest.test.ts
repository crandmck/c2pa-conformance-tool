import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testTrustListFetch } from './trustListTest'

describe('trustListTest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('testTrustListFetch', () => {
    it('should fetch both trust lists successfully', async () => {
      const mockTrustList = '-----BEGIN CERTIFICATE-----\nMockTrustList\n-----END CERTIFICATE-----'
      const mockTsaTrustList = '-----BEGIN CERTIFICATE-----\nMockTsaTrustList\n-----END CERTIFICATE-----'

      global.fetch = vi.fn((url: string) => {
        if (url.includes('C2PA-TRUST-LIST.pem')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(mockTrustList),
            headers: new Headers({
              'content-type': 'application/x-pem-file'
            })
          } as Response)
        } else if (url.includes('C2PA-TSA-TRUST-LIST.pem')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(mockTsaTrustList),
            headers: new Headers({
              'content-type': 'application/x-pem-file'
            })
          } as Response)
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const consoleSpy = vi.spyOn(console, 'log')

      const result = await testTrustListFetch()

      expect(result).toBeDefined()
      expect(result.trustListText).toBe(mockTrustList)
      expect(result.tsaText).toBe(mockTsaTrustList)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅'))
    })

    it('should throw error when trust list fetch fails', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

      const consoleErrorSpy = vi.spyOn(console, 'error')

      await expect(testTrustListFetch()).rejects.toThrow('Network error')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌'),
        expect.any(Error)
      )
    })

    it('should handle HTTP error responses', async () => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
        headers: new Headers({
          'content-type': 'text/plain'
        })
      } as Response))

      const result = await testTrustListFetch()

      // Function still completes even with error responses
      expect(result).toBeDefined()
    })

    it('should log response details', async () => {
      const mockHeaders = new Headers({
        'content-type': 'application/x-pem-file',
        'content-length': '1234'
      })

      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('Mock certificate'),
        headers: mockHeaders
      } as Response))

      const consoleSpy = vi.spyOn(console, 'log')

      await testTrustListFetch()

      expect(consoleSpy).toHaveBeenCalledWith('Status:', 200)
      expect(consoleSpy).toHaveBeenCalledWith('Headers:', expect.any(Object))
    })
  })
})
