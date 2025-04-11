import { Component, OnInit } from '@angular/core';
import { Team } from '../../model/Team';
import { TeamBlock } from '../../model/TeamBlock';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {

  teamList?: Array<Team>;
  teamBlock?: TeamBlock;

  constructor(
    private teamService: TeamService,
  ) {
  }

  ngOnInit() {
    this.teamService.getBlock()
      .subscribe(item => this.teamBlock = item);
    this.teamService.getElements()
      .subscribe(list => this.teamList = list);
  }

}
