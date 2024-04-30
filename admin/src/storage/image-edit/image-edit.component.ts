import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-image-edit',
  templateUrl: './image-edit.component.html',
  styleUrls: ['./image-edit.component.css'],
})
export class ImageEditComponent {

  @Input()
  collectionId: string = '';

  @Input()
  imageList!: Array<{
    id: number,
    path: string,
    original: string,
  }>;

  @Output()
  imageListChange = new EventEmitter();

  @Input()
  editList: Array<{
    id?: number,
    file: File,
    name: string,
    hash: string,
  }> = [];

  @Output()
  editListChange = new EventEmitter();

  handleDeleteImage(id: number) {
    const list = this.imageList.filter(item => item.id !== id);

    this.imageListChange.emit(list);
  }

  handleDeleteEdit(item: typeof this.editList[number]) {
    const list = this.editList.filter(it => it === item);

    this.editListChange.emit(list);
  }

  onLoadImage(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File | undefined = target?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (!this.editList) this.editList = [];

        this.editList.push({
          file: file,
          name: file.name,
          hash: reader.result?.toString() ?? '',
        });
      };
    }
  }

}
