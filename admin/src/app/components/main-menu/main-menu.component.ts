import { Component, OnInit } from '@angular/core';
import { ApiEntity, ApiService } from '../../service/api.service';
import { Block } from '../../model/content/block';
import { Form } from '../../model/form';

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
        link: '/directory',
        icon: 'folder',
      }],
    },
    this.content,
    this.form,
    {
      title: 'Settings',
      child: [{
        title: 'Properties',
        link: '/property',
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
        link: '/user',
        icon: 'person',
      }, {
        title: 'Permission',
        link: '/permission',
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
        link: '/log',
        icon: 'list',
      }],
    },
  ];

  ngOnInit() {
    this.apiService.fetchData<Block>(ApiEntity.BLOCK)
      .then(list => {
        if (list.length > 0) {
          this.content.title = 'Content';
        }

        for (const item of list) {
          this.content.child.push({
            title: 'Block' + String(item.id),
            link: `/content/${item.id}`,
            icon: 'category',
          });
        }
      });

    this.apiService.fetchData<Form>(ApiEntity.FORM)
      .then(list => {
        if (list.length > 0) {
          this.form.title = 'Forms';
        }

        for (const item of list) {
          this.form.child.push({
            title: 'Form ' + String(item.id),
            link: `/form/${item.id}`,
            icon: 'input',
          });
        }
      });
  }

}
