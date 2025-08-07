import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetWebsiteList } from './get-website-list';

describe('GetWebsiteList', () => {
  let component: GetWebsiteList;
  let fixture: ComponentFixture<GetWebsiteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetWebsiteList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetWebsiteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
