import { TeamListComponent } from './team-list.component';
import { TeamService } from '../../services/team.service';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { TeamItemComponent } from '../team-item/team-item.component';
import block from './mock/block';
import list from './mock/list';

const MockService = {
  getBlock: () => {
    return {
      subscribe: (call: any) => {
        call(block);
      },
    };
  },
  getElements: () => {
    return {
      subscribe: (call: any) => {
        call(list);
      },
    };
  },
};

export default {
  title: 'components/TeamList',
  component: TeamListComponent,
  decorators: [
    moduleMetadata({
      providers: [{
        provide: TeamService,
        useValue: MockService,
      }],
      declarations: [TeamItemComponent],
    }),
  ],
};

export const Appear = {
  parameters: {
    viewport: {
      // defaultViewport: 'desktop'
    },
  },
  args: {
    primary: true,
  },
};

export const Mobile = {
  parameters: {
    viewport: {
      defaultViewport: 'iphonex',
    },
  },
  args: {
    primary: true,
  },
};
