import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { DirectoryEntity } from '../../app/model/registry/directory.entity';

@Component({
  selector: 'app-directory-edit',
  templateUrl: './directory-edit.component.html',
  styleUrls: ['./directory-edit.component.css']
})
export class DirectoryEditComponent implements OnInit {

  loading = true;

  list: Array<DirectoryEntity> = [];
  form: FormGroup;
  dirControl = new FormControl();

  @Input() directory: string | null = '';
  @Output() directoryChange = new EventEmitter<string>();

  constructor(
    private apiService: ApiService,
  ) {
    this.form = new FormGroup({
      directory: this.dirControl,
    });

    this.dirControl.valueChanges.subscribe(value => {
      this.directoryChange.emit(value[0]);
    });
  }

  /**
   *
   */
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<DirectoryEntity>(ApiEntity.DIRECTORY),
    ]).then(([dirList]) => {
      this.list = dirList;
      this.loading = false;
    }).then(() => {
      this.form.get('directory')?.setValue([this.directory]);
    });
  }

}
