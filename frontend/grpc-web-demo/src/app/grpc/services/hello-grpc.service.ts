import { Injectable } from '@angular/core';

import { GreeterClient } from '../generated/HelloServiceClientPb';
import { HelloRequest } from '../generated/hello_pb';

@Injectable({ providedIn: 'root' })
export class HelloGrpcService {
  private readonly client = new GreeterClient('http://localhost:8080');

  async sayHello(name: string): Promise<string> {
    const request = new HelloRequest();
    request.setName(name.trim());

    const response = await this.client.sayHello(request);
    return response.getMessage();
  }
}
