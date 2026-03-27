import { checkBoundary, checkOverlaps, rangesOverlap } from '../middleware/collisionEngine.js'

describe('Collision Engine', () => {
  describe('rangesOverlap', () => {
    it('should detect overlapping ranges', () => {
      // Device A: U1-U2, Device B: U2-U3
      expect(rangesOverlap(1, 2, 2, 2)).toBe(true)
    })

    it('should not detect non-overlapping ranges', () => {
      // Device A: U1-U2, Device B: U3-U4
      expect(rangesOverlap(1, 2, 3, 2)).toBe(false)
    })

    it('should detect complete overlap', () => {
      // Device A: U1-U4, Device B: U2-U3
      expect(rangesOverlap(1, 4, 2, 2)).toBe(true)
    })

    it('should handle edge cases at boundaries', () => {
      // Device A: U1-U2, Device B: U3-U5
      expect(rangesOverlap(1, 2, 3, 3)).toBe(false)
    })
  })

  describe('checkBoundary', () => {
    it('should accept valid positions', () => {
      const result = checkBoundary(1, 2, 42)
      expect(result.valid).toBe(true)
    })

    it('should reject positions > rack size', () => {
      const result = checkBoundary(42, 2, 42)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds rack capacity')
    })

    it('should reject start unit < 1', () => {
      const result = checkBoundary(0, 2, 42)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('must be >= 1')
    })

    it('should accept device at top of rack', () => {
      const result = checkBoundary(42, 1, 42)
      expect(result.valid).toBe(true)
    })
  })
})
