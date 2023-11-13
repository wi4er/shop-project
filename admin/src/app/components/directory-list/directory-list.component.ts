import { Component, OnInit } from '@angular/core';
import { CommonList } from '../../common-list/common-list';
import { MatDialog } from '@angular/material/dialog';
import { DirectoryFormComponent } from '../directory-form/directory-form.component';

interface Directory {
  id: number;
  created_at: string;
  updated_at: string;
  flag: string[];
}

@Component({
  selector: 'app-directory-list',
  templateUrl: './directory-list.component.html',
  styleUrls: ['./directory-list.component.css']
})
export class DirectoryListComponent
  extends CommonList
  implements OnInit {

  activeFlags: { [key: string]: string[] } = {};
  columns: string[] = [];
  propertyList: string[] = [];
  flagList: string[] = [];

  constructor(
    private dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchList();
  }

  override fetchList() {
    fetch('http://localhost:3001/directory')
      .then(res => {
        if (!res.ok) throw new Error('Api not found!');
        return res.json();
      })
      .then(list => {
        this.setData(list as Directory[]);
      })
      .catch(err => {
        console.log(err);
      })
  }

  /**
   *
   * @param data
   * @private
   */
  private setData(data: Directory[]) {
    const col = new Set<string>();
    this.activeFlags = {};
    this.list = [];

    for (const item of data) {
      const line: { [key: string]: string } = {
        'id': String(item.id),
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      for (const fl of item.flag) {
        col.add('flag_' + fl);
        line['flag_' + fl] = fl;
      }

      this.activeFlags[item.id] = item.flag;

      this.list.push(line);
    }

    this.columns = [ 'select', 'action', 'id', 'created_at', 'updated_at', ...col ];
  }

  addItem() {
    const dialog = this.dialog.open(
      DirectoryFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
      },
    );

    dialog.afterClosed()
      .subscribe(() => console.log('CLOSE'));
  }

  updateItem(id: number) {
    const dialog = this.dialog.open(
      DirectoryFormComponent,
      {
        width: '1000px',
        panelClass: 'wrapper',
        data: {id},
      },
    );

    dialog.afterClosed()
      .subscribe(() => this.fetchList());
  }

  toggleFlag(id: number, flag: string) {
  }

  deleteList() {
  }

  deleteItem(id: string) {

  }

}
