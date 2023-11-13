import { Component, OnInit } from '@angular/core';

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

  content: MenuGroup = {
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
        title: 'Users',
        link: '/user',
        icon: 'person',
      }, {
        title: 'Directories',
        link: '/directory',
        icon: 'folder',
      }, {
        title: 'Content',
        link: '/content',
        icon: 'category',
      }],
    },
    this.content,
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
      }],
    },
    {
      title: 'Statistics',
      child: [{
        title: 'Logs',
        link: '/log',
        icon: 'list',
      }, {
        title: 'Reports',
        link: '/report',
        icon: 'assessment',
      }],
    },
  ];

  ngOnInit() {
    fetch('http://localhost:3001/block')
      .then(res => {

        return res.json();
      })
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
  }

}
