import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaUsuario } from './cuenta-usuario';

describe('CuentaUsuario', () => {
  let component: CuentaUsuario;
  let fixture: ComponentFixture<CuentaUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuentaUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
