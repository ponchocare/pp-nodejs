import fetch, { type HeadersInit, type Response } from 'node-fetch';
import { joinPaths, serialise, telemetry } from './utils.js';

export class Api {
  private base: string;

  public constructor(base: string = 'https://pay.ponchopay.com/') {
    this.base = base;
  }

  private getUrl(path: string): string {
    return joinPaths(this.base, path);
  }

  private getHeaders(): HeadersInit {
    return {
      'content-type': 'application/json',
      'x-telemetry': serialise(telemetry()),
    };
  }

  public async makePostRequest(
    path: string,
    headers: HeadersInit,
    body: string,
  ): Promise<Response> {
    return await fetch(this.getUrl(path), {
      method: 'post',
      headers: { ...headers, ...this.getHeaders() },
      body,
      redirect: 'manual',
    });
  }

  public async makePutRequest(
    url: string,
    headers: HeadersInit,
    body: string,
  ): Promise<Response> {
    return await fetch(this.getUrl(url), {
      method: 'put',
      headers: { ...headers, ...this.getHeaders() },
      body,
      redirect: 'manual',
    });
  }
}
