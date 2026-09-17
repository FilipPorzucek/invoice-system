import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerInvoiceViewComponent } from './manager-invoice-view.component';

describe('ManagerInvoiceViewComponent', () => {
  let component: ManagerInvoiceViewComponent;
  let fixture: ComponentFixture<ManagerInvoiceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerInvoiceViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerInvoiceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
