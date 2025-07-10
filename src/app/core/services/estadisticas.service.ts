
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface Partida {
  id: number;
  nombre: string;
  estado: string;
  resultado: 'Ganada' | 'Perdida' | string;
  oponente: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private baseUrl = `${environment.apiUrl}/estadisticas`;

    constructor(private http: HttpClient) {}

  obtenerResumen() {
    return this.http.get<{ ganadas: number; perdidas: number }>(`${this.baseUrl}/resumen`);
  }

  obtenerPartidas(tipo: 'ganadas' | 'perdidas'): Observable<Partida[]> {
    return this.http.get<Partida[]>(`${this.baseUrl}/partidas/${tipo}`);
  }

  obtenerDetallePartida(id: number) {
    return this.http.get<any>(`${this.baseUrl}/partida/${id}`);
  }
}
