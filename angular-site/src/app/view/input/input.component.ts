import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {

  @Input()
  placeholder: string = '';

  @Input()
  type: string = '';

  @Input()
  value: string = '';

  @Output()
  valueChange = new EventEmitter<string>();

  handleChange(event: Event) {
    const {value} = event.target as HTMLInputElement;
    this.valueChange.emit(value)
  }

}
