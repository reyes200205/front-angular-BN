import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePartidaComponent } from './detalle-partida.component';

describe('DetallePartidaComponent', () => {
  let component: DetallePartidaComponent;
  let fixture: ComponentFixture<DetallePartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePartidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
