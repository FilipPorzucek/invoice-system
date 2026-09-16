import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInvoiceViewComponent } from './employee-invoice-view.component';

describe('EmployeeInvoiceViewComponent', () => {
  let component: EmployeeInvoiceViewComponent;
  let fixture: ComponentFixture<EmployeeInvoiceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeInvoiceViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeInvoiceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
