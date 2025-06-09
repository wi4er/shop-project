import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { BlockEntity } from '../../app/model/content/block.entity';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-block-edit',
  templateUrl: './block-edit.component.html',
  styleUrls: ['./block-edit.component.css'],
})
export class BlockEditComponent implements OnInit {

  loading = true;

  list: Array<BlockEntity> = [];
  form: FormGroup;
  blockControl = new FormControl();

  @Input() block: string | null = '';
  @Output() blockChange = new EventEmitter<string>();

  constructor(
    private apiService: ApiService,
  ) {
    this.form = new FormGroup({
      block: this.blockControl,
    });

    this.blockControl.valueChanges.subscribe(value => {
      this.blockChange.emit(value[0]);
    });
  }

  /**
   *
   */
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<BlockEntity>(ApiEntity.BLOCK),
    ]).then(([blockList]) => {
      this.list = blockList;

      this.loading = false;
    }).then(() => {
      this.form.get('block')?.setValue([this.block]);
    });
  }

}
