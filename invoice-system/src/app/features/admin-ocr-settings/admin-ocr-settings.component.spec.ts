import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOcrSettingsComponent } from './admin-ocr-settings.component';

describe('AdminOcrSettingsComponent', () => {
  let component: AdminOcrSettingsComponent;
  let fixture: ComponentFixture<AdminOcrSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOcrSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOcrSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
