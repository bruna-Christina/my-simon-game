import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface DialogResponse{
  action:boolean;
  name:string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {score:number}
  ) { }

  public name:string = null;

  public nameFormControl:FormControl = new FormControl('', [
    Validators.required,
  ]);;

  public matcher = new MyErrorStateMatcher();

  ngOnInit() {
  }

  public confirmSelection(btnAction: boolean) {
    if(btnAction && this.nameFormControl.errors !== null){
      return;
    }
    const response: DialogResponse = {
      action:btnAction,
      name:this.name
    }
    this.dialogRef.close(response);
  }

}
