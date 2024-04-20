import { Component, Inject } from '@angular/core';
import { Property } from '../../app/model/settings/property';
import { Lang } from '../../app/model/settings/lang';
import { Flag } from '../../app/model/settings/flag';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { FileInput } from '../../app/model/storage/file.input';
import { File as FileEntity } from '../../app/model/storage/file';

@Component({
  selector: 'app-file-form',
  templateUrl: './file-form.component.html',
  styleUrls: ['./file-form.component.css']
})
export class FileFormComponent {

  original: string = '';
  mimetype: string = '';
  created_at: string = '';
  updated_at: string = '';

  propertyList: Property[] = [];
  langList: Lang[] = [];
  flagList: Flag[] = [];

  editFile?: {
    name: string,
    hash: string,
  };
  editProperties: { [property: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<FileFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string } | null,
    private apiService: ApiService,
  ) {
  }

  ngOnInit(): void {
    Promise.all([
      this.apiService.fetchList<Property>(ApiEntity.PROPERTY),
      this.apiService.fetchList<Flag>(ApiEntity.FLAG),
      this.apiService.fetchList<Lang>(ApiEntity.LANG),
    ]).then(([property, flag, lang]) => {
      this.propertyList = property;
      this.flagList = flag;
      this.langList = lang;

      this.initEditValues();
    }).then(() => {
      if (this.data?.id) {
        this.apiService.fetchItem<FileEntity>(ApiEntity.FILE, this.data.id)
          .then(res => this.toEdit(res));
      }
    });
  }

  getPropertyCount() {
    return Object.values(this.editProperties)
      .flatMap(item => Object.values(item).filter(item => item))
      .length;
  }

  onFileLoad(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File | undefined = target?.files?.[0];

    if (file) {
      const reader = new FileReader();
      const data = new FormData();

      reader.readAsDataURL(file);
      reader.onload = () => {
        this.editFile = {
          name: file.name,
          hash: reader.result?.toString() ?? '',
        };
        this.original = file.name;
        this.mimetype = file.type;

        console.log(file);

        // data.append('file', file);
      };
    }
  }

  initEditValues() {
    for (const prop of this.propertyList) {
      this.editProperties[prop.id] = {};

      for (const lang of this.langList) {
        this.editProperties[prop.id][lang.id] = [{value: ''}];
      }
    }

    for (const flag of this.flagList) {
      this.editFlags[flag.id] = false;
    }
  }

  toEdit(item: FileEntity) {
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    for (const prop of item.property) {
      if (!this.editProperties[prop.property]) {
        this.editProperties[prop.property] = {};
      }

      if (!this.editProperties[prop.property][prop.lang ?? '']) {
        this.editProperties[prop.property][prop.lang ?? ''] = [];
      }

      this.editProperties[prop.property][prop.lang ?? ''].push({
        value: prop.string,
        error: '',
      });
    }

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  toInput(): FileInput {
    const input: FileInput = {
      property: [],
      flag: [],
    } as FileInput;

    for (const prop in this.editProperties) {
      for (const lang in this.editProperties[prop]) {
        if (!this.editProperties[prop][lang]) {
          continue;
        }

        for (const value of this.editProperties[prop][lang]) {
          input.property.push({
            property: prop,
            string: value.value,
            lang: lang || undefined,
          });
        }
      }
    }

    for (const flag in this.editFlags) {
      if (this.editFlags[flag]) {
        input.flag.push(flag);
      }
    }

    return input;
  }

  saveItem() {




    // if (this.data?.id) {
    //   this.apiService.putData<FileInput>(
    //     ApiEntity.FILE,
    //     this.data.id,
    //     this.toInput(),
    //   ).then(() => {
    //     this.dialogRef.close();
    //   });
    // } else {
    //   this.apiService.postData<FileInput>(
    //     ApiEntity.FILE,
    //     this.toInput(),
    //   ).then(() => {
    //     this.dialogRef.close();
    //   });
    // }
  }

}
