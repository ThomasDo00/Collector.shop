import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @aws-sdk/client-s3 — single send() spy reused across all tests
// ---------------------------------------------------------------------------
const mockSend = vi.hoisted(() => vi.fn());

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({ send: mockSend })),
  HeadBucketCommand: vi.fn().mockImplementation((p) => ({ ...p, _type: 'HeadBucket' })),
  CreateBucketCommand: vi.fn().mockImplementation((p) => ({ ...p, _type: 'CreateBucket' })),
  PutBucketPolicyCommand: vi.fn().mockImplementation((p) => ({ ...p, _type: 'PutBucketPolicy' })),
  PutObjectCommand: vi.fn().mockImplementation((p) => ({ ...p, _type: 'PutObject' })),
  DeleteObjectCommand: vi.fn().mockImplementation((p) => ({ ...p, _type: 'DeleteObject' })),
}));

import {
  initStorage,
  uploadFile,
  deleteFile,
  getPublicUrl,
} from '../../../../src/core/storage/index.js';

describe('storage module', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  // -------------------------------------------------------------------------
  // initStorage
  // -------------------------------------------------------------------------
  describe('initStorage', () => {
    it('does not create the bucket when it already exists', async () => {
      mockSend.mockResolvedValueOnce({}); // HeadBucketCommand succeeds

      await initStorage();

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('creates bucket and sets public-read policy when bucket is missing', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('NoSuchBucket')) // HeadBucketCommand → not found
        .mockResolvedValueOnce({})                         // CreateBucketCommand
        .mockResolvedValueOnce({});                        // PutBucketPolicyCommand

      await initStorage();

      expect(mockSend).toHaveBeenCalledTimes(3);
    });
  });

  // -------------------------------------------------------------------------
  // uploadFile
  // -------------------------------------------------------------------------
  describe('uploadFile', () => {
    it('uploads the buffer and returns a public URL', async () => {
      mockSend.mockResolvedValueOnce({});

      const url = await uploadFile(Buffer.from('img-data'), 'photo.jpg', 'image/jpeg');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(url).toMatch(/^\/storage\/collector-images\/products\/.+\.jpg$/);
    });

    it('preserves file extension in the generated key', async () => {
      mockSend.mockResolvedValueOnce({});

      const url = await uploadFile(Buffer.from('data'), 'avatar.png', 'image/png');
      expect(url).toMatch(/\.png$/);
    });

    it('handles filename without extension', async () => {
      mockSend.mockResolvedValueOnce({});

      const url = await uploadFile(Buffer.from('data'), 'noext', 'image/jpeg');
      // path.extname('noext') === '' so key ends without extension
      expect(url).toMatch(/^\/storage\/collector-images\/products\//);
    });
  });

  // -------------------------------------------------------------------------
  // deleteFile
  // -------------------------------------------------------------------------
  describe('deleteFile', () => {
    it('extracts the key and sends a DeleteObjectCommand', async () => {
      mockSend.mockResolvedValueOnce({});

      await deleteFile('/storage/collector-images/products/uuid.jpg');

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('is a no-op when the URL does not contain the bucket prefix', async () => {
      await deleteFile('https://cdn.external.com/image.jpg');

      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // getPublicUrl
  // -------------------------------------------------------------------------
  describe('getPublicUrl', () => {
    it('builds the nginx-proxied public path', () => {
      const url = getPublicUrl('products/some-uuid.jpg');
      expect(url).toBe('/storage/collector-images/products/some-uuid.jpg');
    });
  });
});
