import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PartidaService } from '../../core/services/partida.service';
import { EstadisticasService } from '../../core/services/estadisticas.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { EstadisticasGraficaComponent } from '../estadisticas-grafica/estadisticas-grafica.component';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, EstadisticasGraficaComponent],
  templateUrl: './estadisticas.component.html',
})
export class EstadisticasComponent implements OnInit {
  ganadas = 0;
  perdidas = 0;
  error = '';
  cargando = true;

constructor(private estadisticasService: EstadisticasService, private router: Router) {
}


 ngOnInit() {
  this.estadisticasService.obtenerResumen().subscribe({
    next: (res) => {
      this.ganadas = res.ganadas;
      this.perdidas = res.perdidas;
      this.cargando = false;
    },
    error: (err) => {
      
      this.error = 'Error al obtener estadísticas';
      this.cargando = false;
    },
    complete: () => {
      
    }
  });
}


  onBarClick(tipo: 'ganadas' | 'perdidas') {
      this.router.navigate(['/app/mis-partidas'], { queryParams: { filtro: tipo === 'ganadas' ? 'Ganada' : 'Perdida' } });
  }
}
