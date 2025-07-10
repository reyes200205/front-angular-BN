// mis-partidas.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PartidaService } from '../../core/services/partida.service';
import { CommonModule } from '@angular/common';

interface Partida {
  id: number;
  nombre: string;
  oponente: string;
  estado: 'en_curso' | 'finalizada' | 'esperando';
  resultado: 'Ganada' | 'Perdida' | null;
  createdAt: string;
}

@Component({
  selector: 'app-mis-partidas',
  imports: [CommonModule],
  templateUrl: './mis-partidas.component.html',
  styleUrls: ['./mis-partidas.component.css']
})
export class MisPartidasComponent implements OnInit {
  partidas: Partida[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private partidaService: PartidaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPartidas();
  }

  cargarPartidas(): void {
  this.loading = true;
  this.error = null;
  
  this.partidaService.getMisPartidas().subscribe({
    next: (response) => {
      console.log('Respuesta de mis partidas:', response);
      if (response.success) {
        this.partidas = response.data.map(partida => ({
          id: partida.id,
          nombre: partida.nombre,
          oponente: partida.oponente,
          estado: this.normalizarEstado(partida.estado),
          resultado: partida.resultado,
          createdAt: partida.createdAt,
          
        }));
      } else {
        this.error = 'Error al cargar las partidas';
      }
      this.loading = false;
    },
    error: (error) => {
      this.error = 'Error de conexión';
      console.error('Error al cargar partidas:', error);
      this.loading = false;
    }
  });
}

  private normalizarEstado(estado: string): 'en_curso' | 'finalizada' | 'esperando' {
    switch (estado) {
      case 'en_curso':
        return 'en_curso';
      case 'finalizado':
        return 'finalizada';
      case '':
        return 'esperando';
      default:
        return 'esperando';
    }
  }

  unirseAPartida(partidaId: number): void {
    this.router.navigate(['/app/juego', partidaId]);
  }

  verDetalles(partidaId: number): void {
    this.router.navigate(['/app/partidas', partidaId], {
      queryParams: { from: 'mis-partidas' }
    });
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getEstadoClasses(estado: string): string {
    switch (estado) {
      case 'en_curso':
        return 'text-green-600 font-bold';
      case 'finalizada':
        return 'text-gray-600';
      default:
        return 'text-yellow-600';
    }
  }

  getResultadoClasses(resultado: string | null): string {
    switch (resultado) {
      case 'Ganada':
        return 'text-green-600 font-bold';
      case 'Perdida':
        return 'text-red-600 font-bold';
      default:
        return '';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'en_curso':
        return 'En curso';
      case 'finalizado':
        return 'Finalizada';
      case 'esperando':
        return 'Esperando';
      default:
        return estado;
    }
  }

  trackByPartidaId(index: number, partida: Partida): number {
    return partida.id;
  }
}