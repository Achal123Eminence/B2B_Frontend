import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWebite } from './add-webite';

describe('AddWebite', () => {
  let component: AddWebite;
  let fixture: ComponentFixture<AddWebite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWebite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWebite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
