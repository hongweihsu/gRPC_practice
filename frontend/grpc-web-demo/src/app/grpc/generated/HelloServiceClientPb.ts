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

  constructor(hostname: string, options?: grpcWeb.GrpcWebClientBaseOptions) {
    this.hostname = hostname;
    this.client = new grpcWeb.GrpcWebClientBase({
      format: 'text',
      ...options,
    });
  }

  sayHello(request: HelloRequest, metadata?: grpcWeb.Metadata): Promise<HelloReply> {
    return new Promise<HelloReply>((resolve, reject) => {
      this.client.rpcCall(
        `${this.hostname}/hello.Greeter/SayHello`,
        request,
        metadata ?? {},
        methodDescriptorGreeterSayHello,
        (err, response) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(response);
        }
      );
    });
  }
}
