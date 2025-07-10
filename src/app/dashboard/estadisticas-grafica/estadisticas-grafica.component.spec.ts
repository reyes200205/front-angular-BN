import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasGraficaComponent } from './estadisticas-grafica.component';

describe('EstadisticasGraficaComponent', () => {
  let component: EstadisticasGraficaComponent;
  let fixture: ComponentFixture<EstadisticasGraficaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasGraficaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasGraficaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
