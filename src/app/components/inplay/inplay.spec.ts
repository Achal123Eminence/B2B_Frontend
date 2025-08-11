import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inplay } from './inplay';

describe('Inplay', () => {
  let component: Inplay;
  let fixture: ComponentFixture<Inplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Inplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
