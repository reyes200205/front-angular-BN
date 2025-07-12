// streaming.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-streaming',
  imports: [CommonModule],
  template: `
    <div class="streaming-container">
      <h2>🐠 Streaming de Pecera en Vivo</h2>
      
      <div class="status-info" *ngIf="status">
        <p><strong>Estado:</strong> 
          <span [class]="status.status === 'active' ? 'status-active' : 'status-inactive'">
            {{ status.status === 'active' ? '● Activo' : '○ Inactivo' }}
          </span>
        </p>
        <p><strong>Resolución:</strong> {{ status.resolution }}</p>
        <p><strong>FPS:</strong> {{ status.fps }}</p>
      </div>

      <div class="video-container">
        <img 
          [src]="streamingUrl" 
          alt="Streaming de la pecera"
          (load)="onImageLoad()"
          (error)="onImageError()"
          class="streaming-video"
        >
      </div>

      <div class="controls">
        <button (click)="toggleStreaming()" [disabled]="isLoading">
          {{ isStreaming ? 'Pausar' : 'Iniciar' }} Streaming
        </button>
        <button (click)="refreshStream()" [disabled]="isLoading">
          Actualizar
        </button>
      </div>

      <div class="connection-info">
        <h3>Información de Conexión</h3>
        <p><strong>URL del Servidor:</strong> <code>{{ serverUrl }}</code></p>
        <p><strong>Endpoint:</strong> <code>{{ streamingUrl }}</code></p>
      </div>
    </div>
  `,
  styles: [`
    .streaming-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .status-info {
      background: #e7f3ff;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .status-active {
      color: green;
      font-weight: bold;
    }

    .status-inactive {
      color: red;
      font-weight: bold;
    }

    .video-container {
      background: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      margin: 20px 0;
    }

    .streaming-video {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border: 2px solid #007bff;
    }

    .controls {
      text-align: center;
      margin: 20px 0;
    }

    .controls button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 0 10px;
      cursor: pointer;
    }

    .controls button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .controls button:hover:not(:disabled) {
      background: #0056b3;
    }

    .connection-info {
      background: #f1f1f1;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }

    code {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
  `]
})
export class StreamingComponent implements OnInit, OnDestroy {
  // Cambia esta URL por la que te da ngrok
  serverUrl = 'https://bfb5ed610ab1.ngrok-free.app'; // ← Aquí va tu URL de ngrok
  streamingUrl = '';
  status: any = null;
  isStreaming = true;
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.streamingUrl = `${this.serverUrl}/pecera-streaming/123`;
    this.checkStatus();
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  checkStatus() {
    this.http.get(`${this.serverUrl}/status`).subscribe({
      next: (data) => {
        this.status = data;
        console.log('Estado del servidor:', data);
      },
      error: (error) => {
        console.error('Error al obtener estado:', error);
        this.status = { status: 'error', message: 'No se pudo conectar al servidor' };
      }
    });
  }

  toggleStreaming() {
    this.isStreaming = !this.isStreaming;
    if (this.isStreaming) {
      this.streamingUrl = `${this.serverUrl}/pecera-streaming/123`;
    } else {
      this.streamingUrl = '';
    }
  }

  refreshStream() {
    this.isLoading = true;
    // Añade un timestamp para forzar recarga
    this.streamingUrl = `${this.serverUrl}/pecera-streaming/123?t=${Date.now()}`;
    this.checkStatus();
    
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  onImageLoad() {
    console.log('Streaming cargado correctamente');
  }

  onImageError() {
    console.error('Error al cargar streaming');
  }
}