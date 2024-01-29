import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent {

  @Input()
  text: string = '';

  @Input()
  checked: boolean = false;

  @Output()
  checkedChange = new EventEmitter<boolean>();

  @HostListener('click', ['$event'])
  handleClick(event: Event) {
    this.checkedChange.emit(!this.checked);
  }

}
