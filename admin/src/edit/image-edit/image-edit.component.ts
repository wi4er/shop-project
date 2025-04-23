import { Component, Input, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../../app/service/api.service';
import { Collection } from '../../app/model/storage/collection';


interface ImageAttach {
  id?: number,
  file?: File,
  name: string,
  hash: string,
}

@Component({
  selector: 'app-image-edit',
  templateUrl: './image-edit.component.html',
  styleUrls: ['./image-edit.component.css'],
})
export class ImageEditComponent implements OnInit {

  loading = true;

  collectionList: Array<Collection> = [];

  @Input()
  edit: {
    [collection: string]: Array<ImageAttach>
  } = {};

  @Input()
  imageList: {
    [collection: string]: Array<{
      id: number,
      path: string,
      original: string,
    }>
  } = {};

  constructor(
    private apiService: ApiService,
  ) {
  }

  /**
   *
   */
  ngOnInit() {
    Promise.all([
      this.apiService.fetchList<Collection>(ApiEntity.COLLECTION),
    ]).then(([collection]) => {
      this.collectionList = collection;

      this.initValues();
      this.loading = false;
    });
  }

  initValues() {
    for (const item of this.collectionList) {
      this.edit[item.id] = [];
    }
  }

  /**
   *
   */
  handleDeleteImage(imageId: number, collectionId: string) {
    const index = this.imageList[collectionId].findIndex(item => item.id !== imageId);

    this.imageList[index].splice(index, 1);
  }

  /**
   *
   */
  handleDeleteEdit(item: ImageAttach, id: string) {
    const index = this.edit[id].findIndex(it => it === item);

    this.edit[id].splice(index, 1);
  }

  /**
   *
   */
  onLoadImage(event: Event, id: string) {
    const target = event.target as HTMLInputElement;
    const file: File | undefined = target?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (!Array.isArray(this.edit[id])) this.edit[id] = [];

        this.edit[id].push({
          file: file,
          name: file.name,
          hash: reader.result?.toString() ?? '',
        });
      };
    }
  }

}
