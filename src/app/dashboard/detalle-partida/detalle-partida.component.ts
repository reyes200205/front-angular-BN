import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableroComponent, Disparo } from '../tablero/tablero.component';
import { AuthService } from '../../core/services/auth.service';
import { PartidaService } from '../../core/services/partida.service';

interface Usuario {
  id: number;
  name: string;
  email: string;
}

interface Barco {
  id: number;
  coordenada: string;
  tipo: string;
}

interface Movimiento {
  id: number;
  coordenada: string;
  acierto: boolean;
  hundido: boolean;
}

interface Jugador {
  id: number;
  usuario: Usuario;
  barcos: Barco[];
  movimientos_atacante: Movimiento[];
  movimientos_defensor: Movimiento[];
}

interface Partida {
  id: number;
  estado: string;
  ganador_id?: number;
  jugadores: Jugador[];
}

@Component({
  selector: 'app-detalle-partida',
  standalone: true,
  imports: [CommonModule, TableroComponent],
  templateUrl: './detalle-partida.component.html',
  styleUrls: ['./detalle-partida.component.css']
})
export class DetallePartidaComponent implements OnInit {
  partida: Partida | null = null;
  movimientos: any[] = [];
  from: string = 'mis-partidas';
  loading = true;
  error: string | null = null;
  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private partidaService: PartidaService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id ?? null;

    this.route.params.subscribe(params => {
      const id = params['id'];
      this.from = this.route.snapshot.queryParams['from'] || 'mis-partidas';
      this.cargarDetalle(id);
    });
  }

  async cargarDetalle(id: string): Promise<void> {
    try {
      this.loading = true;
      const response = await this.partidaService.obtenerDetalle(id, this.from);
      this.partida = response.partida;
      this.movimientos = response.movimientos;
      this.error = null;
    } catch (error) {
      this.error = 'Error al cargar los detalles de la partida';
      console.error('Error:', error);
    } finally {
      this.loading = false;
    }
  }

  get miJugador(): Jugador | null {
    if (!this.partida || !this.userId) return null;
    return this.partida.jugadores.find(j => j.usuario.id === this.userId) || null;
  }

  get oponenteJugador(): Jugador | null {
    if (!this.partida || !this.userId) return null;
    return this.partida.jugadores.find(j => j.usuario.id !== this.userId) || null;
  }

  get posicionesBarcosJugador(): string[] {
    return this.miJugador?.barcos?.map(b => b.coordenada) ?? [];
  }

  get posicionesBarcosOponente(): string[] {
    return this.oponenteJugador?.barcos?.map(b => b.coordenada) ?? [];
  }

  get disparosRecibidosJugador(): Disparo[] {
    return this.convertirMovimientosADisparos(this.miJugador?.movimientos_defensor ?? []);
  }

  get disparosRecibidosOponente(): Disparo[] {
    return this.convertirMovimientosADisparos(this.oponenteJugador?.movimientos_defensor ?? []);
  }

  convertirMovimientosADisparos(movimientos: Movimiento[]): Disparo[] {
    return movimientos.map(mov => ({
      posicion: mov.coordenada,
      impacto: mov.acierto,
      hundido: mov.hundido
    }));
  }

  volver(): void {
    switch (this.from) {
      case 'mis-partidas':
        this.router.navigate(['/mis-partidas']);
        break;
      case 'ganadas':
        this.router.navigate(['/estadisticas/partidas/ganadas']);
        break;
      case 'perdidas':
        this.router.navigate(['/estadisticas/partidas/perdidas']);
        break;
      default:
        this.router.navigate(['/mis-partidas']);
        break;
    }
  }

  obtenerClaseResultado(acierto: boolean, hundido: boolean): string {
    if (hundido) return 'text-red-600 font-bold';
    if (acierto) return 'text-green-600 font-semibold';
    return 'text-blue-600';
  }

  obtenerTextoResultado(acierto: boolean, hundido: boolean): string {
    if (hundido) return 'Hundido';
    if (acierto) return 'Impacto';
    return 'Agua';
  }
}
