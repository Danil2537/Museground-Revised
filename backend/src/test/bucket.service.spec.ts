/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException } from '@nestjs/common';
import { BucketService } from '../r2bucket/bucket.service';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3', () => {
  const original = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...original,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
  };
});

const mockConfig = {
  ACCESS_TOKEN_KEY_ID: 'test-id',
  SECRET_ACCESS_KEY: 'test-secret',
  BUCKET_NAME: 'test-bucket',
  R2_PRIVATE_ENDPOINT: 'https://private',
  R2_ENDPOINT: 'https://public',
};

describe('BucketService', () => {
  let service: BucketService;
  let configService: ConfigService;
  let s3Client: any;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => mockConfig[key]),
    } as any;

    service = new BucketService(configService);

    // access the internal mocked S3 client
    s3Client = (service as any).s3;
  });

  describe('constructor', () => {
    it('should initialize S3 client and bucket', () => {
      expect(S3Client).toHaveBeenCalledTimes(1);
      expect((service as any).bucket).toEqual('test-bucket');
    });

    it('should throw if env variables missing', () => {
      configService.get = jest.fn().mockReturnValue(null);
      expect(() => new BucketService(configService)).toThrow(BadRequestException);
    });
  });

  describe('uploadFile', () => {
    it('should upload file and return url', async () => {
      s3Client.send.mockResolvedValue({});

      const result = await service.uploadFile('file.txt', Buffer.from('abc'), 'text/plain');

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result).toEqual({
        key: 'file.txt',
        url: 'https://public/file.txt',
      });
    });
  });

  describe('deleteFileByKey', () => {
    it('should delete file by key', async () => {
      s3Client.send.mockResolvedValue({});

      const result = await service.deleteFileByKey('aaa.png');

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
      expect(result).toEqual({ deleted: true, key: 'aaa.png' });
    });
  });

  describe('createFolder', () => {
    it('should create folder with trailing slash', async () => {
      s3Client.send.mockResolvedValue({});

      const result = await service.createFolder('folder');

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result).toEqual({
        key: 'folder/',
        url: 'https://public/folder/',
      });
    });
  });

  describe('deleteFolder', () => {
    it('should list and delete all objects in folder', async () => {
      s3Client.send
        .mockResolvedValueOnce({
          Contents: [{ Key: 'folder/a.txt' }, { Key: 'folder/b.txt' }],
        })
        .mockResolvedValueOnce({});

      const res = await service.deleteFolder('folder');

      expect(s3Client.send).toHaveBeenNthCalledWith(1, expect.any(ListObjectsV2Command));
      expect(s3Client.send).toHaveBeenNthCalledWith(2, expect.any(DeleteObjectsCommand));
      expect(res).toEqual({ deleted: true, prefix: 'folder/' });
    });

    it('should skip deletion if folder empty', async () => {
      s3Client.send.mockResolvedValue({ Contents: [] });

      const res = await service.deleteFolder('folder');

      expect(s3Client.send).toHaveBeenCalledTimes(1); // only list
      expect(res).toEqual({ deleted: true, prefix: 'folder/' });
    });
  });

  describe('getFile', () => {
    it('should return readable stream', async () => {
      const mockStream = {} as any;
      s3Client.send.mockResolvedValue({ Body: mockStream });

      const result = await service.getFile('abc.txt');

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
      expect(result).toBe(mockStream);
    });
  });

  describe('getPublicUrl', () => {
    it('should build public url correctly', () => {
      const result = service.getPublicUrl('a/b/c.png');
      expect(result).toBe('https://public/a/b/c.png');
    });
  });
});
