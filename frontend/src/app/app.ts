import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Greeting } from '@shared/greeting';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App implements OnInit {
  private http = inject(HttpClient);
  protected message = signal('Loading...');

  ngOnInit() {
    this.http.get<Greeting>('/api/hello').subscribe({
      next: (res) => this.message.set(res.message),
      error: (err) => {
        console.error(err);
        this.message.set('Could not reach the server');
      },
    });
  }
}
