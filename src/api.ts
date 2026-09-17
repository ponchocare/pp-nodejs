import fetch, { type HeadersInit, type Response } from 'node-fetch';
import { joinPaths, serialise, telemetry } from './utils.js';

/**
 * Creates a new API client instance, establishing a connection to the payment gateway
 * and configuring necessary default settings.
 */
export class Api {
  private base: string;
  private headers: HeadersInit;

  /**
   * @param base    The base URL for the API endpoint
   * @param headers Optional initial headers to apply to all requests
   */
  public constructor(base: string, headers: HeadersInit = {}) {
    this.base = base;
    this.headers = headers;
  }

  /**
   * Constructs the full, absolute URL for a given API path by combining it with the base URL.
   *
   * @param path The relative path segment
   *
   * @return The fully qualified URL
   */
  private getUrl(path: string): string {
    return joinPaths(this.base, path);
  }

  /**
   * Merges the instance's base headers with required headers for a request, ensuring content type and telemetry are included.
   *
   * @return  The complete set of headers to be used for the API request
   */
  private getHeaders(): HeadersInit {
    return {
      ...this.headers,
      'content-type': 'application/json',
      'x-telemetry': serialise(telemetry()),
    };
  }

  /**
   * Executes the core HTTP request logic using the configured HTTP client, handling method, path, headers, and body.
   *
   * @param method  The HTTP method to use (e.g., 'GET', 'POST', 'PUT')
   * @param path    The relative path on the API endpoint
   * @param headers Headers specific to this request
   * @param body    The body content for the request
   *
   * @return The response object returned by the underlying HTTP client
   */
  private async makeRequest(
    method: string,
    path: string,
    headers: HeadersInit,
    body?: string,
  ): Promise<Response> {
    return await fetch(this.getUrl(path), {
      method,
      headers: { ...headers, ...this.getHeaders() },
      body,
      redirect: 'manual',
    });
  }

  /**
   * Performs an HTTP GET request to a specified path on the API.
   *
   * @param path    The relative path on the API endpoint to call
   * @param headers Additional headers to include in the GET request
   *
   * @returns The response received from the API call
   */

  public async makeGetRequest(
    path: string,
    headers: HeadersInit,
  ): Promise<Response> {
    return await this.makeRequest('get', path, headers);
  }

  /**
   * Performs an HTTP POST request to a specified path on the API, sending data in the body.
   *
   * @param path    The relative path on the API endpoint to call
   * @param headers Additional headers to include in the POST request
   * @param body    The payload data to be sent in the request body
   *
   * @return The response received from the API call
   */

  public async makePostRequest(
    path: string,
    headers: HeadersInit,
    body: string,
  ): Promise<Response> {
    return await this.makeRequest('post', path, headers, body);
  }

  /**
   * Performs an HTTP PUT request to a specified path on the API, updating resources with the given body.
   *
   * @param path    The relative path on the API endpoint to call
   * @param headers Additional headers to include in the PUT request
   * @param body    The payload data used for updating the resource
   *
   * @return The response received from the API call
   */
  public async makePutRequest(
    path: string,
    headers: HeadersInit,
    body: string,
  ): Promise<Response> {
    return await this.makeRequest('put', path, headers, body);
  }
}
