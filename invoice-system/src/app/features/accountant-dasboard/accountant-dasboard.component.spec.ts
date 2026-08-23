import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountantDasboardComponent } from './accountant-dasboard.component';

describe('AccountantDasboardComponent', () => {
  let component: AccountantDasboardComponent;
  let fixture: ComponentFixture<AccountantDasboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountantDasboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountantDasboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
