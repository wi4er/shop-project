import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { CollectionEntity } from '../../app/model/storage/collection.entity';

@Component({
  selector: 'app-collection-edit',
  templateUrl: './collection-edit.component.html',
  styleUrls: ['./collection-edit.component.css'],
})
export class CollectionEditComponent implements OnInit {

  loading = true;

  list: Array<CollectionEntity> = [];
  form: FormGroup;
  collectionControl = new FormControl();

  @Input() collection: string | null = '';
  @Output() collectionChange = new EventEmitter<string>();

  constructor(
    private apiService: ApiService,
  ) {
    this.form = new FormGroup({
      collection: this.collectionControl,
    });

    this.collectionControl.valueChanges.subscribe(value => {
      this.collectionChange.emit(value[0]);
    });
  }

  /**
   *
   */
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<CollectionEntity>(ApiEntity.COLLECTION),
    ]).then(([collList]) => {
      this.list = collList;

      this.loading = false;
    }).then(() => {
      this.form.get('collection')?.setValue([this.collection]);
    });
  }

}
