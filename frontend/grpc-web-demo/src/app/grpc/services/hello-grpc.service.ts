import { Injectable } from '@angular/core';
import { StatusCode } from 'grpc-web';

import { GreeterClient } from '../generated/HelloServiceClientPb';
import { HelloRequest } from '../generated/hello_pb';

@Injectable({ providedIn: 'root' })
export class HelloGrpcService {
  private readonly client = new GreeterClient('http://localhost:8080');
  private readonly defaultTimeoutMs = 5000;
  private readonly maxRetries = 1;

  async sayHello(name: string): Promise<string> {
    const request = new HelloRequest();
    request.setName(name.trim());

    return this.callWithRetry(request);
  }

  private async callWithRetry(request: HelloRequest): Promise<string> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.sayHello(request, {}, this.defaultTimeoutMs);
        return response.getMessage();
      } catch (err) {
        lastError = err;
        const code = this.getGrpcCode(err);
        const canRetry = code === StatusCode.UNAVAILABLE && attempt < this.maxRetries;

        if (!canRetry) {
          break;
        }
      }
    }

    throw new Error(this.toUserMessage(lastError));
  }

  private getGrpcCode(err: unknown): number | null {
    if (typeof err !== 'object' || err === null || !('code' in err)) {
      return null;
    }

    const value = (err as { code?: unknown }).code;
    return typeof value === 'number' ? value : null;
  }

  private toUserMessage(err: unknown): string {
    if (err instanceof Error && err.message.includes('timed out')) {
      return 'Request timeout: please verify backend/proxy is running.';
    }

    const code = this.getGrpcCode(err);

    switch (code) {
      case StatusCode.UNAVAILABLE:
        return 'Service unavailable: check backend or grpc-web proxy.';
      case StatusCode.DEADLINE_EXCEEDED:
        return 'Deadline exceeded: the server took too long to respond.';
      case StatusCode.INVALID_ARGUMENT:
        return 'Invalid argument: please check your input.';
      default:
        return err instanceof Error ? err.message : 'Unknown RPC error';
    }
  }
}
