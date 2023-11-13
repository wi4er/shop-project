import { PageEvent } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";

export abstract class CommonList {

  list: { [key: string]: string }[] = [];

  pageEvent?: PageEvent;
  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;

  selection = new SelectionModel<{ [key: string]: string }>(true, []);

  abstract fetchList(): void;

  isAllSelected() {
    return this.selection.selected.length === this.list.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.list);
    }
  }

  changePage(event: PageEvent) {
    this.pageEvent = event;
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.fetchList();
  }

}
