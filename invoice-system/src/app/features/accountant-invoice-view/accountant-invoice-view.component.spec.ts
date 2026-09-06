import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountantInvoiceViewComponent } from './accountant-invoice-view.component';

describe('AccountantInvoiceViewComponent', () => {
  let component: AccountantInvoiceViewComponent;
  let fixture: ComponentFixture<AccountantInvoiceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountantInvoiceViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountantInvoiceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
