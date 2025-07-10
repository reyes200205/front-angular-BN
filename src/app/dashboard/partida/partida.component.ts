import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { TableroComponent } from '../tablero/tablero.component';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

export interface Usuario {
  id: number;
  fullName: string;
  email: string;
}

export interface Partida {
  id: number;
  estado: string;
  ganador_id?: number;
}

export interface JugadorPartida {
  id: number;
  id_usuario: number;
  es_turno: boolean;
  usuario: Usuario;
}

export interface TableroData {
  barcos: string[];
  disparos: DisparoHistorial[];
  estadisticas: {
    totalDisparos: number;
    impactos: number;
    precision: number;
  };
  esPropio: boolean;
  mostrarBarcos: boolean;
  puedeDisparar: boolean;
}

export interface DisparoHistorial {
  posicion: string;
  resultado: 'agua' | 'impacto' | 'hundido';
  impacto: boolean;
  hundido: boolean;
}

export interface Movimiento {
  posicion: string;
  resultado: 'agua' | 'impacto' | 'hundido';
  esPropio: boolean;
}

export interface Mensaje {
  texto: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
}

@Component({
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrls: ['./partida.component.css'],
  imports: [CommonModule, TableroComponent]
})
export class PartidaComponent implements OnInit, OnDestroy {
  partidaId: string = '';
  partida: Partida | null = null;
  jugadorActual: JugadorPartida | null = null;
  oponente: JugadorPartida | null = null;
  miTablero: TableroData | null = null;
  tableroOponente: TableroData | null = null;
  esMiTurno: boolean = false;
  juegoTerminado: boolean = false;
  ganador: string | null = null;
  
  mensaje: Mensaje | null = null;
  cargando: boolean = false;
  private pollingSubscription?: Subscription;
  private mensajeTimeout?: any;
  
  apiUrl: string = 'http://localhost:3333';
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.partidaId = this.route.snapshot.params['id'];
    this.cargarEstadoInicial();
  }

  ngOnDestroy(): void {
    this.detenerPolling();
    if (this.mensajeTimeout) {
      clearTimeout(this.mensajeTimeout);
    }
  }

  private async cargarEstadoInicial(): Promise<void> {
    this.cargando = true;
    
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/tablero/${this.partidaId}`).toPromise();
      
      if (response?.success) {
        this.procesarDatosTablero(response.data);
        this.iniciarPolling();
        this.mostrarMensajeInicial();
      } else {
        this.mostrarMensaje(response?.error || 'Error al cargar el tablero', 'error');
        
        if (response?.redirect) {
          this.router.navigate([response.redirect]);
          return;
        }
      }
    } catch (error: any) {
      console.error('Error al cargar tablero:', error);
      this.mostrarMensaje('Error de conexión', 'error');
    } finally {
      this.cargando = false;
    }
  }

  private procesarDatosTablero(data: any): void {
    this.partida = data.partida;
    this.jugadorActual = data.jugadorActual;
    this.oponente = data.oponente || null;
    this.miTablero = data.miTablero;
    this.tableroOponente = data.tableroOponente;
    this.esMiTurno = data.esMiTurno;
    this.juegoTerminado = data.juegoTerminado;
    this.ganador = data.ganador;
  }

  get ultimosMovimientos(): Movimiento[] {
    const movimientos: Movimiento[] = [];

    if (this.miTablero?.disparos && Array.isArray(this.miTablero.disparos)) {
      this.miTablero.disparos.forEach((disparo) => {
        movimientos.push({
          posicion: disparo.posicion,
          resultado: disparo.resultado,
          esPropio: false 
        });
      });
    }

    if (this.tableroOponente?.disparos && Array.isArray(this.tableroOponente.disparos)) {
      this.tableroOponente.disparos.forEach((disparo) => {
        movimientos.push({
          posicion: disparo.posicion,
          resultado: disparo.resultado,
          esPropio: true 
        });
      });
    }

    return movimientos.slice(-10).reverse();
  }

  get puedeDisparar(): boolean {
    return this.esMiTurno && 
           !this.juegoTerminado && 
           !this.cargando;
  }

  async realizarDisparo(evento: { posicion: string }): Promise<void> {
    if (this.cargando || !this.esMiTurno || this.juegoTerminado) {
      console.warn('Intento de disparo bloqueado:', {
        cargando: this.cargando,
        esMiTurno: this.esMiTurno,
        juegoTerminado: this.juegoTerminado
      });
      this.mostrarMensaje('No puedes disparar en este momento', 'advertencia');
      return;
    }

    this.cargando = true;

    try {
      const response = await this.http.post<any>(
        `${this.apiUrl}/tablero/${this.partidaId}/disparar`,
        { posicion: evento.posicion }
      ).toPromise();

      if (response?.success) {
        this.mostrarMensaje(response.mensaje || 'Disparo realizado', 'info');

        this.esMiTurno = response.esMiTurno;
        
        if (response.juegoTerminado) {
          this.juegoTerminado = true;
          this.ganador = 'jugador';
          this.detenerPolling();
          this.mostrarMensaje('¡Has ganado la partida!', 'exito');
        }

        await this.actualizarEstadoJuego();
      } else {
        this.mostrarMensaje(response?.error || 'Error al realizar el disparo', 'error');
      }
    } catch (error: any) {
      const errorMsg = error.error?.error || error.error?.message || 'Error al realizar el disparo';
      this.mostrarMensaje(errorMsg, 'error');
    } finally {
      this.cargando = false;
    }
  }

  onCeldaHover(evento: { posicion: string }): void {
    console.log('Hover en celda:', evento.posicion);
  }

  mostrarMensaje(texto: string, tipo: Mensaje['tipo'] = 'info'): void {
    this.mensaje = { texto, tipo };
    
    if (this.mensajeTimeout) {
      clearTimeout(this.mensajeTimeout);
    }
    
    this.mensajeTimeout = setTimeout(() => {
      this.mensaje = null;
    }, 6000);
  }

  obtenerTextoResultado(resultado: string): string {
    switch (resultado) {
      case 'agua':
        return 'AGUA';
      case 'impacto':
        return 'IMPACTO';
      case 'hundido':
        return 'HUNDIDO';
      default:
        return resultado?.toUpperCase() || 'DESCONOCIDO';
    }
  }

  async actualizarJuego(): Promise<void> {
    if (this.cargando) return;

    this.cargando = true;
    await this.actualizarEstadoJuego();
    this.cargando = false;
  }

  volverAPartidas(): void {
    this.router.navigate(['/partidas']);
  }

  salirDelJuego(): void {
    this.detenerPolling();
    this.volverAPartidas();
  }

  private async actualizarEstadoJuego(): Promise<void> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/tablero/${this.partidaId}`).toPromise();
      
      if (response?.success) {
        this.procesarDatosTablero(response.data);

        if (this.juegoTerminado) {
          this.detenerPolling();
          this.mostrarMensajeFinal();
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado del juego:', error);
    }
  }

  private iniciarPolling(): void {
    this.pollingSubscription = interval(4000)
      .pipe(
        switchMap(() => {
          if (!this.cargando && !this.juegoTerminado) {
            return this.http.get<any>(`${this.apiUrl}/tablero/${this.partidaId}`);
          }
          return of(null);
        }),
        catchError(error => {
          console.error('Error en polling:', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response?.success) {
          this.procesarDatosTablero(response.data);

          if (this.juegoTerminado) {
            this.detenerPolling();
            this.mostrarMensajeFinal();
          }
        }
      });
  }

  private detenerPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  private mostrarMensajeInicial(): void {
    if (this.juegoTerminado) {
      this.mostrarMensajeFinal();
    } else if (this.esMiTurno) {
      this.mostrarMensaje(
        '¡Es tu turno! Haz click en el tablero enemigo para disparar',
        'info'
      );
    } else {
      this.mostrarMensaje(
        `Turno de ${this.oponente?.usuario?.fullName || 'oponente'}`,
        'info'
      );
    }
  }

  private mostrarMensajeFinal(): void {
    let textoGanador = '';
    let tipoMensaje: Mensaje['tipo'] = 'info';

    if (this.ganador === 'jugador') {
      textoGanador = '¡Felicitaciones! Has ganado la partida';
      tipoMensaje = 'exito';
    } else if (this.ganador === 'oponente') {
      textoGanador = 'Has perdido esta partida';
      tipoMensaje = 'error';
    } else {
      textoGanador = 'El juego ha terminado';
      tipoMensaje = 'info';
    }

    if (textoGanador) {
      this.mostrarMensaje(textoGanador, tipoMensaje);
    }
  }
}