import { Component, Input } from '@angular/core';
import { Team } from '../../model/Team';

@Component({
  selector: 'app-team-item',
  templateUrl: './team-item.component.html',
  styleUrls: ['./team-item.component.css']
})
export class TeamItemComponent {

  @Input()
  item!: Team;

  onInit() {
    console.log(this.item);
  }

}
