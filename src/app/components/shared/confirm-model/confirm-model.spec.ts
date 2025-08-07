import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmModel } from './confirm-model';

describe('ConfirmModel', () => {
  let component: ConfirmModel;
  let fixture: ComponentFixture<ConfirmModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
