import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarHistoriaClinicaComponent } from './agregar-historia-clinica.component';

describe('AgregarHistoriaClinicaComponent', () => {
  let component: AgregarHistoriaClinicaComponent;
  let fixture: ComponentFixture<AgregarHistoriaClinicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarHistoriaClinicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarHistoriaClinicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
