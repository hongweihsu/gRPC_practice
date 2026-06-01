import * as grpcWeb from 'grpc-web';

import { HelloReply, HelloRequest } from './hello_pb';

const methodDescriptorGreeterSayHello = new grpcWeb.MethodDescriptor(
  '/hello.Greeter/SayHello',
  grpcWeb.MethodType.UNARY,
  HelloRequest,
  HelloReply,
  (request: HelloRequest): Uint8Array => request.serializeBinary(),
  HelloReply.deserializeBinary
);

export class GreeterClient {
  private readonly client: grpcWeb.GrpcWebClientBase;
  private readonly hostname: string;

  static readonly defaultTimeoutMs = 5000;

  constructor(hostname: string, options?: grpcWeb.GrpcWebClientBaseOptions) {
    this.hostname = hostname;
    this.client = new grpcWeb.GrpcWebClientBase({
      format: 'text',
      ...options,
    });
  }

  sayHello(
    request: HelloRequest,
    metadata?: grpcWeb.Metadata,
    timeoutMs = GreeterClient.defaultTimeoutMs
  ): Promise<HelloReply> {
    return new Promise<HelloReply>((resolve, reject) => {
      let settled = false;

      const call = this.client.rpcCall(
        `${this.hostname}/hello.Greeter/SayHello`,
        request,
        metadata ?? {},
        methodDescriptorGreeterSayHello,
        (err, response) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timeout);

          if (err) {
            reject(err);
            return;
          }

          resolve(response);
        }
      );

      const timeout = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        call.cancel();
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }
}
