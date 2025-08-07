import { TwitterApiClient } from '../../apiClient';
import * as httpx from 'httpx';

jest.mock('httpx', () => ({
  fetch: jest.fn(),
}));

describe('TwitterApiClient Integration Tests', () => {
  let client: TwitterApiClient;

  beforeEach(() => {
    client = new TwitterApiClient();
    jest.clearAllMocks();
  });

  describe('Error Handling', () => {
    test('should handle 401 Unauthorized error', async () => {
      const mockFetch = jest.spyOn(httpx, 'fetch');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(client.fetchTweets('test', 10)).rejects.toThrow('Twitter API error: 401 Unauthorized');

      expect(consoleSpy).toHaveBeenCalledWith('Twitter API Error:', expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith('Authentication failed. Please check your Twitter API credentials.');

      mockFetch.mockRestore();
      consoleSpy.mockRestore();
    });

    test('should handle 429 Rate Limit error', async () => {
      const mockFetch = jest.spyOn(httpx, 'fetch');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(client.fetchTweets('test', 10)).rejects.toThrow('Twitter API error: 429 Too Many Requests');

      expect(consoleSpy).toHaveBeenCalledWith('Twitter API Error:', expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith('Rate limit exceeded. Please try again later.');

      mockFetch.mockRestore();
      consoleSpy.mockRestore();
    });

    test('should handle 500 Server Error', async () => {
      const mockFetch = jest.spyOn(httpx, 'fetch');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(client.fetchTweets('test', 10)).rejects.toThrow('Twitter API error: 500 Internal Server Error');

      expect(consoleSpy).toHaveBeenCalledWith('Twitter API Error:', expect.any(Error));

      mockFetch.mockRestore();
      consoleSpy.mockRestore();
    });

    test('should handle network error', async () => {
      const mockFetch = jest.spyOn(httpx, 'fetch');
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(client.fetchTweets('test', 10)).rejects.toThrow('Network error');

      expect(consoleSpy).toHaveBeenCalledWith('Twitter API Error:', networkError);

      mockFetch.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Response Processing', () => {
    test('should process and normalize response data correctly', async () => {
      // Arrange
      const mockRawResponse = {
        data: [
          {
            id: '12345',
            text: 'This is a test tweet',
            created_at: '2023-08-01T12:00:00Z',
            author_id: '67890',
            public_metrics: {
              like_count: 10,
              retweet_count: 5,
              reply_count: 2,
              quote_count: 1,
            },
            referenced_tweets: [
              {
                type: 'quoted',
                id: '54321',
              },
            ],
          },
          {
            id: '12346',
            text: 'Another tweet',
            created_at: '2023-08-01T12:05:00Z',
            author_id: '67891',
            public_metrics: {
              like_count: 15,
              retweet_count: 8,
              reply_count: 3,
              quote_count: 2,
            },
            // referenced_tweets is missing (optional field)
          },
        ],
      };

      const mockFetch = jest.spyOn(httpx, 'fetch');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockRawResponse),
      } as any);

      // Act
      const result = await client.fetchTweets('#test', 10);

      // Assert
      expect(result).toEqual([
        {
          id: '12345',
          text: 'This is a test tweet',
          createdAt: '2023-08-01T12:00:00Z',
          authorId: '67890',
          metrics: {
            like_count: 10,
            retweet_count: 5,
            reply_count: 2,
            quote_count: 1,
          },
          referencedTweets: [
            {
              type: 'quoted',
              id: '54321',
            },
          ],
        },
        {
          id: '12346',
          text: 'Another tweet',
          createdAt: '2023-08-01T12:05:00Z',
          authorId: '67891',
          metrics: {
            like_count: 15,
            retweet_count: 8,
            reply_count: 3,
            quote_count: 2,
          },
          referencedTweets: [],
        },
      ]);
    });

    test('should handle empty response data', async () => {
      // Arrange
      const mockRawResponse = {
        data: [],
      };

      const mockFetch = jest.spyOn(httpx, 'fetch');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockRawResponse),
      } as any);

      // Act
      const result = await client.fetchTweets('#test', 10);

      // Assert
      expect(result).toEqual([]);
    });

    test('should handle missing data in response', async () => {
      // Arrange
      const mockRawResponse = {}; // No data property

      const mockFetch = jest.spyOn(httpx, 'fetch');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockRawResponse),
      } as any);

      // Act
      const result = await client.fetchTweets('#test', 10);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
