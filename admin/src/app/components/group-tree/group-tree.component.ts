import { Component, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Group } from '../../model/user/group';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
      },
      {
        name: 'Orange',
        children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
      },
    ],
  },
];

@Component({
  selector: 'app-group-tree',
  templateUrl: './group-tree.component.html',
  styleUrls: ['./group-tree.component.css']
})
export class GroupTreeComponent implements OnInit {

  list: Group[] = [];

  treeControl = new NestedTreeControl<FoodNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<FoodNode>();

  constructor(
    private apiService: ApiService
  ) {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit() {
    this.apiService.fetchList<Group>(ApiEntity.GROUP)
      .then(list => {
        this.list = list;
      });
  }

  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;

}
