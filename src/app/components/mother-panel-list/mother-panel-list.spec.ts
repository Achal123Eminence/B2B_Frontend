import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotherPanelList } from './mother-panel-list';

describe('MotherPanelList', () => {
  let component: MotherPanelList;
  let fixture: ComponentFixture<MotherPanelList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotherPanelList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotherPanelList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
