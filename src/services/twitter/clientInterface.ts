/**
 * Abstract interface defining the contract for Twitter client implementations.
 * Ensures consistent behavior between real API clients and mock implementations.
 */
export abstract class TwitterClientInterface {
  /**
   * Fetches tweets from the Twitter API based on a search query.
   *
   * @param {string} query - The search term or hashtag to fetch tweets for (e.g., "#angular" or "JavaScript").
   * @param {number} limit - The maximum number of tweets to retrieve. Must be a positive integer.
   * @returns {Promise<any>} A promise that resolves to the raw response data from the Twitter API.
   * @abstract
   */
  abstract fetchTweets(query: string, limit: number): Promise<any>;

  /**
   * Handles errors that occur during API interaction.
   *
   * @param {unknown} error - The error object thrown during a Twitter API call.
   *                        This could be a network error, authentication failure, or API rate limit.
   * @returns {void} This method does not return a value. It should handle the error appropriately,
   *                such as logging it or transforming it into a standardized format.
   * @abstract
   */
  abstract handleError(error: unknown): void;

  /**
   * Processes raw response data from the Twitter API into a standardized format.
   *
   * @param {any} responseData - The raw data returned by the Twitter API.
   *                            Expected to be in JSON format with tweet objects.
   * @returns {any} Processed data in a consistent format (e.g., array of simplified tweet objects).
   *               The exact structure may vary by implementation.
   * @abstract
   */
  abstract processResponse(responseData: any): any;
}
