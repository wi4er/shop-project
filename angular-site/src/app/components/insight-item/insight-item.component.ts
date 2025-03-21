import { Component, Input } from '@angular/core';
import { Insight } from '../../model/Insight';

@Component({
  selector: 'app-insight-item',
  templateUrl: './insight-item.component.html',
  styleUrls: ['./insight-item.component.css']
})
export class InsightItemComponent {

  @Input({required: true})
  item!: Insight;

}
