import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetBanners } from './get-banners';

describe('GetBanners', () => {
  let component: GetBanners;
  let fixture: ComponentFixture<GetBanners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetBanners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetBanners);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
