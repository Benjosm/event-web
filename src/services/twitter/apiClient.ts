import { TwitterClientInterface } from './clientInterface';
import * as httpx from 'httpx';
import { TWITTER_BEARER_TOKEN } from '../../config/env';

/**
 * Production implementation of the TwitterClientInterface that makes actual API calls to Twitter.
 * Uses HTTP requests to interact with the Twitter API and handles authentication.
 */
export class TwitterApiClient extends TwitterClientInterface {
  private readonly API_BASE_URL = 'https://api.twitter.com/2';
  private readonly authorizationHeader: string;

  constructor() {
    super();
    // Using Bearer Token for authentication
    if (!TWITTER_BEARER_TOKEN) {
      throw new Error('TWITTER_BEARER_TOKEN is not configured');
    }
    this.authorizationHeader = `Bearer ${TWITTER_BEARER_TOKEN}`;
  }

  /**
   * Fetches tweets from the Twitter API based on a search query.
   * @param query - The search term or hashtag to fetch tweets for
   * @param limit - The maximum number of tweets to retrieve
   * @returns A promise that resolves to the raw response data from the Twitter API
   */
  async fetchTweets(query: string, limit: number): Promise<any> {
    try {
      // Validate inputs
      if (!query || query.trim().length === 0) {
        throw new Error('Query parameter is required');
      }
      if (limit <= 0) {
        throw new Error('Limit must be a positive integer');
      }

      // Construct query parameters
      const params = new URLSearchParams({
        query: query.trim(),
        max_results: limit.toString(),
        'tweet.fields': 'created_at,author_id,public_metrics,referenced_tweets',
      });

      // Make the HTTP request to Twitter API
      const response = await httpx.fetch(
        `${this.API_BASE_URL}/tweets/search/recent?${params}`,
        {
          headers: {
            'Authorization': this.authorizationHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handles errors that occur during API interaction.
   * @param error - The error object thrown during a Twitter API call
   * @returns void
   */
  handleError(error: unknown): void {
    // Log the error - in a real application, this might be sent to an error tracking service
    console.error('Twitter API Error:', error);

    // Handle specific error types if needed
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('Authentication failed. Please check your Twitter API credentials.');
      } else if (error.message.includes('429')) {
        console.error('Rate limit exceeded. Please try again later.');
      }
    }
  }

  /**
   * Processes raw response data from the Twitter API into a standardized format.
   * @param responseData - The raw data returned by the Twitter API
   * @returns Processed data in a consistent format
   */
  processResponse(responseData: any): any {
    // If there's no data in the response, return empty array
    if (!responseData || !responseData.data) {
      return [];
    }

    // Transform the Twitter API response into a simplified format
    return responseData.data.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      authorId: tweet.author_id,
      metrics: tweet.public_metrics,
      referencedTweets: tweet.referenced_tweets || [],
    }));
  }
}
