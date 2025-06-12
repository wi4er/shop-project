import { Component, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../service/api.service';
import { BlockEntity } from '../model/content/block.entity';
import { Form } from '../model/form/form';
import { CollectionEntity } from '../model/storage/collection.entity';
import { StringAttributeValue } from '../model/common/string-attribute-value';
import { CommonAttributeValue } from '../model/common/common-attribute-value';

interface MenuItem {
  title: string;
  link: string;
  icon: string;
}

interface MenuGroup {
  title: string;
  child: MenuItem[];
}

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})
export class MainMenuComponent implements OnInit {

  constructor(
    private apiService: ApiService,
  ) {
  }

  content: MenuGroup = {
    title: '',
    child: [],
  };

  form: MenuGroup = {
    title: '',
    child: [],
  };

  document: MenuGroup = {
    title: '',
    child: [],
  };

  collection: MenuGroup = {
    title: '',
    child: [],
  };

  list: MenuGroup[] = [
    {
      title: '',
      child: [{
        title: 'Dashboard',
        link: '/',
        icon: 'home',
      }, {
        title: 'Content',
        link: '/content',
        icon: 'category',
      }, {
        title: 'Form',
        link: '/form',
        icon: 'input',
      }, {
        title: 'Directories',
        link: '/registry',
        icon: 'folder',
      }, {
        title: 'Documents',
        link: '/bundle',
        icon: 'notes',
      }, {
        title: 'Storage',
        link: '/storage',
        icon: 'store',
      }],
    },
    this.content,
    this.form,
    this.document,
    this.collection,
    {
      title: 'Settings',
      child: [{
        title: 'Attributes',
        link: '/attribute',
        icon: 'display_settings',
      }, {
        title: 'Flags',
        link: '/flag',
        icon: 'flag',
      }, {
        title: 'Languages',
        link: '/lang',
        icon: 'translate',
      }],
    },
    {
      title: 'Personalization',
      child: [{
        title: 'Users',
        link: '/personal',
        icon: 'person',
      }, {
        title: 'Permission',
        link: '/access',
        icon: 'lock',
      }],
    },
    {
      title: 'Statistics',
      child: [{
        title: 'Reports',
        link: '/report',
        icon: 'assessment',
      }, {
        title: 'Logs',
        link: '/registry-log',
        icon: 'list',
      }],
    },
  ];

  /**
   *
   */
  findName(list: Array<CommonAttributeValue>): string | undefined {
    const attr = list.find(item => item.attribute === 'NAME');

    if (attr && 'string' in attr) return attr.string;

    return undefined;
  }

  ngOnInit() {
    this.apiService.fetchList<BlockEntity>(ApiEntity.BLOCK)
      .then(list => {
        if (list.length > 0) {
          this.content.title = 'Content blocks';
        }

        for (const item of list) {
          const name = this.findName(item.attribute) ?? String(item.id);

          this.content.child.push({
            title: name,
            link: `/content/${item.id}`,
            icon: 'category',
          });
        }
      });

    this.apiService.fetchList<Form>(ApiEntity.FORM)
      .then(list => {
        if (list.length > 0) {
          this.form.title = 'Forms';
        }

        for (const item of list) {
          this.form.child.push({
            title: String(item.id),
            link: `/form/${item.id}`,
            icon: 'input',
          });
        }
      });

    this.apiService.fetchList<CollectionEntity>(ApiEntity.COLLECTION)
      .then(list => {
        if (list.length > 0) this.form.title = 'File collections';

        for (const item of list) {
          this.form.child.push({
            title: String(item.id),
            link: `/collection/${item.id}`,
            icon: 'store',
          });
        }
      });
  }

}
