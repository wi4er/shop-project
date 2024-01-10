import { Component, Input, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Group } from '../../model/user/group';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FormControl } from '@angular/forms';
import { logBuildStats } from '@angular-devkit/build-angular/src/tools/esbuild/utils';

interface GroupNode {
  id: number;
  parent: number;
  name: string;
  children?: GroupNode[];
}

@Component({
  selector: 'app-group-tree',
  templateUrl: './group-tree.component.html',
  styleUrls: ['./group-tree.component.css'],
})
export class GroupTreeComponent implements OnInit {

  list: Group[] = [];
  checked: { [id: number]: FormControl } = {};

  treeControl = new NestedTreeControl<GroupNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<GroupNode>();

  @Input()
  groupList?: number[];

  constructor(
    private apiService: ApiService,
  ) {
  }

  @Input()
  multiple: boolean = false;

  @Input()
  onChange(id: number[]) {
    console.log(id);
  }

  handleChange(id: number) {
    if (!this.multiple) {
      for (const i in this.checked) {
        if (i !== String(id)) this.checked[i].setValue(false);
      }
    }

    const res: number[] = [];

    for (const key in this.checked) {
      if (this.checked[key].getRawValue()) {
        res.push(Number(key));
      }
    }

    this.onChange(res);
  }

  private toData(list: Group[]): GroupNode[] {
    const nodes: { [index: number]: GroupNode } = {};

    for (const item of list) {
      nodes[item.id] = {
        id: item.id,
        parent: item.parent,
        name: `group ${item.id}`,
        children: [],
      };

      this.checked[item.id] = new FormControl(this.groupList?.includes(item.id));
    }

    for (const item in nodes) {
      const key = nodes[item].parent;

      if (key) nodes[key]?.children?.push(nodes[item]);
    }

    return Object.values(nodes).filter(it => !it.parent);
  }

  ngOnInit() {
    this.apiService.fetchList<Group>(ApiEntity.GROUP)
      .then(list => {
        this.dataSource.data = this.toData(list);
      });
  }

  hasChild = (_: number, node: GroupNode) => !!node.children && node.children.length > 0;

}
