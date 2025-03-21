import { Component } from '@angular/core';
import { Insight } from '../../model/Insight';
import list from './mock/list';

@Component({
  selector: 'app-insight-list',
  templateUrl: './insight-list.component.html',
  styleUrls: ['./insight-list.component.css']
})
export class InsightListComponent {

  insList: Array<Insight> = list;

}
