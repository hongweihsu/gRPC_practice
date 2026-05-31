import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HelloGrpcService } from './grpc/services/hello-grpc.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly helloService = inject(HelloGrpcService);

  name = 'gRPC learner';
  response = '';
  error = '';
  isLoading = false;

  async sendGreeting(): Promise<void> {
    this.error = '';
    this.response = '';
    this.isLoading = true;

    try {
      this.response = await this.helloService.sayHello(this.name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.error = `Call failed: ${message}`;
    } finally {
      this.isLoading = false;
    }
  }
}
