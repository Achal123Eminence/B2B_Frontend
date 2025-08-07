import { Component,Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-model',
  imports: [],
  templateUrl: './confirm-model.html',
  styleUrls: ['./confirm-model.css'],
  standalone:true
})
export class ConfirmModel {
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() show: boolean = false;

  @Output() confirm = new EventEmitter<boolean>();

  onCancel() {
    this.confirm.emit(false);
  }

  onOkay() {
    this.confirm.emit(true);
  }
}
