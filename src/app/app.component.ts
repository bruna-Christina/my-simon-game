import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public isGameShowing:boolean = true;
  
  public toggleView(){
    this.isGameShowing = !this.isGameShowing;
  }
}
