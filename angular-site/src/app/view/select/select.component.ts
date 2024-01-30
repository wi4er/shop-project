import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent {

  open: boolean = false;

  @Input()
  label: string = ''

  @Input()
  list: Array<{
    id: string;
    name: string;
  }> = [];

  @Input()
  current?: string;

  @Output()
  currentChange = new EventEmitter<string>();

  getCurrentName(): string {
    const cur = this.list.find(item => item.id === this.current);
    return cur?.name ?? '';
  }

  handleOpen() {
    this.open = !this.open;
  }

  handleClick(id: string) {
    this.open = false;
    this.currentChange.emit(id);
  }


}
