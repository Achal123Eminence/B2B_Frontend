import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMotherPanel } from './add-mother-panel';

describe('AddMotherPanel', () => {
  let component: AddMotherPanel;
  let fixture: ComponentFixture<AddMotherPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMotherPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMotherPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
