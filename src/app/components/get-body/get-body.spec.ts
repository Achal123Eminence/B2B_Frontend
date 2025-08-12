import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetBody } from './get-body';

describe('GetBody', () => {
  let component: GetBody;
  let fixture: ComponentFixture<GetBody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetBody]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetBody);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
