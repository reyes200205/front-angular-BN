import { Component } from '@angular/core';
import { PartidaService } from '../../core/services/partida.service';
import { CommonModule } from '@angular/common';
import { PartidaAPi } from '../../core/services/partida.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-partidas-index',
  imports: [CommonModule],
  templateUrl: './partidas-index.component.html',
  styleUrl: './partidas-index.component.css'
})
export class PartidasIndexComponent {
  partidas: PartidaAPi[] = [];
  loading: boolean = false;

  constructor(private partidaService: PartidaService, private router: Router) {}

  ngOnInit(): void {
    this.getPartidas();
  }

  private getPartidas(): void {
    this.loading = true;
    this.partidaService.getPartidas().subscribe(
      (partidas: PartidaAPi[]) => {
        this.partidas = partidas;
        this.loading = false;
      }
    )
  }

  unirsePartida(partida: PartidaAPi): void {
  this.partidaService.unirsePartida(partida).subscribe({
    next: (response) => {
      console.log('Respuesta al unirse a partida:', response);
      
      if (response && response.success && response.data) {
        const partidaData = response.data;
        console.log('Datos de la partida:', partidaData);
        
        const partidaId = partidaData.id || partida.id;
        if (partidaId) {
          this.router.navigate(['/app/juego', partidaId]);
        } else {
          console.error('No se pudo obtener el ID de la partida');
        }
      } else {
        console.error('Respuesta inesperada del servidor:', response);
      }
    },
    error: (error) => {
      console.error('Error al unirse a la partida:', error);
    }
  });
}
}
