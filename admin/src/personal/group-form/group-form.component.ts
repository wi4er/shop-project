import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { GroupInput } from '../../app/model/user/group.input';
import { Group } from '../../app/model/user/group';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttributeValueService } from '../../edit/attribute-value/attribute-value.service';

@Component({
  selector: 'app-user-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.css'],
})
export class GroupFormComponent implements OnInit {

  id: string = '';
  type: string = '';
  created_at: string = '';
  updated_at: string = '';

  editAttributes: { [attribute: string]: { [lang: string]: { value: string, error?: string }[] } } = {};
  editFlags: { [field: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<GroupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number } | null,
    private apiService: ApiService,
    private errorBar: MatSnackBar,
    private attributeValueService: AttributeValueService,
  ) {
    if (data?.id) this.id = String(data.id);
  }

  /**
   *
   */
  ngOnInit(): void {
    Promise.all([
      this.data?.id ? this.apiService.fetchItem<Group>(ApiEntity.GROUP, String(this.data.id)) : null,
    ]).then(([data]) => {
      this.initEditValues();
      if (data) this.toEdit(data);
    });
  }

  /**
   *
   */
  getAttributeCount() {
    return Object.values(this.editAttributes)
      .flatMap(item => Object.values(item).filter(item => item))
      .length;
  }

  /**
   *
   */
  initEditValues() {
  }

  /**
   *
   */
  toEdit(item: Group) {
    this.id = String(item.id);
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;

    for (const prop of item.attribute) {
      this.editAttributes[prop.attribute][prop.lang ?? ''].push({
        value: prop.string,
        error: '',
      });
    }

    for (const flag of item.flag) {
      this.editFlags[flag] = true;
    }
  }

  /**
   *
   */
  toInput(): GroupInput {
    const input: GroupInput = {
      id: this.id,
      attribute: [],
      flag: [],
    } as GroupInput;

    input.attribute = this.attributeValueService.toInput(this.editAttributes);

    for (const flag in this.editFlags) {
      if (this.editFlags[flag]) {
        input.flag.push(flag);
      }
    }

    return input;
  }

  /**
   *
   */
  sendItem(): Promise<string> {
    if (this.data?.id) {
      return this.apiService.putData<GroupInput>(
        ApiEntity.GROUP,
        this.data.id,
        this.toInput(),
      );
    } else {
      return this.apiService.postData<GroupInput>(
        ApiEntity.GROUP,
        this.toInput(),
      );
    }
  }

  /**
   *
   */
  saveItem() {
    this.sendItem()
      .then(() => this.dialogRef.close())
      .catch((err: string) => {
        this.errorBar.open(err, 'close', {duration: 5000});
      });
  }

}
