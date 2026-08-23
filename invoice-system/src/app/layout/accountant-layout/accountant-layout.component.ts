import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-accountant-layout',
    imports: [RouterOutlet,TopbarComponent],
  templateUrl: './accountant-layout.component.html',
  styleUrl: './accountant-layout.component.scss'
})
export class AccountantLayoutComponent {

}
