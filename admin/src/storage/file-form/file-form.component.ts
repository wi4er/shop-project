import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FileInput } from '../../app/model/storage/file.input';
import { File as FileEntity } from '../../app/model/storage/file';
import { HttpClient } from '@angular/common/http';
import { AttributeEdit, AttributeValueService } from '../../edit/attribute-value/attribute-value.service';
import { FlagEdit, FlagValueService } from '../../edit/flag-value/flag-value.service';

@Component({
  selector: 'app-file-form',
  templateUrl: './file-form.component.html',
  styleUrls: ['./file-form.component.css'],
})
export class FileFormComponent implements OnInit {

  original: string = '';
  mimetype: string = '';
  created_at: string = '';
  updated_at: string = '';
  file?: File;

  editFile?: {
    name: string,
    hash: string,
  };
  editAttributes: AttributeEdit = {};
  editFlags: FlagEdit = {};

  constructor(
    private dialogRef: MatDialogRef<FileFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
    private http: HttpClient,
    private attributeValueService: AttributeValueService,
    private flagValueService: FlagValueService,
  ) {
  }

  /**
   *
   */
  ngOnInit(): void {
    if (this.data?.id) {
      this.apiService.fetchItem<FileEntity>(ApiEntity.FILE, this.data.id)
        .then(res => this.toEdit(res));
    }
  }

  /**
   *
   */
  onFileLoad(event: Event) {
    const target = event.target as HTMLInputElement;
    this.file = target?.files?.[0];

    if (this.file) {
      const reader = new FileReader();

      reader.readAsDataURL(this.file);
      reader.onload = () => {
        if (this.file) {
          this.editFile = {
            name: this.file.name,
            hash: reader.result?.toString() ?? '',
          };
          this.original = this.file.name;
          this.mimetype = this.file.type;
        }
      };
    }
  }

  /**
   *
   */
  toEdit(item: FileEntity) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    this.editAttributes = this.attributeValueService.toEdit(item.attribute);
    this.editFlags = this.flagValueService.toEdit(item.flag);
  }

  /**
   *
   */
  toInput(): FileInput {
    return {
      attribute: this.attributeValueService.toInput(this.editAttributes),
      flag: this.flagValueService.toInput(this.editFlags),
    };
  }

  /**
   *
   */
  saveItem() {
    const data = new FormData();

    if (this.data?.id) {
      this.apiService.putData<FileInput>(
        ApiEntity.FILE,
        this.data.id,
        this.toInput(),
      ).then(() => {
        this.dialogRef.close();
      });
    } else if (this.file) {
      data.append('file', this.file);

      this.http.post<FileEntity>('http://localhost:3030/upload', data)
        .subscribe(res => {
          this.apiService.putData<FileInput>(
            ApiEntity.FILE,
            res.id,
            this.toInput(),
          ).then(res => {
            this.dialogRef.close();
          });
        });
    }
  }

}
