import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBody } from './add-body';

describe('AddBody', () => {
  let component: AddBody;
  let fixture: ComponentFixture<AddBody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBody]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBody);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
