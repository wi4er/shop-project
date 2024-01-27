import { Meta, StoryObj } from '@storybook/angular';
import { CommonHeaderComponent } from './common-header.component';
import { CommonFooterComponent } from '../common-footer/common-footer.component';

const meta: Meta<CommonHeaderComponent> = {
  title: 'Component/CommonHeader',
  component: CommonHeaderComponent,
};

export default meta;

export const Desktop: StoryObj<CommonHeaderComponent> = {
  args: {},
};

export const Mobile: StoryObj<CommonHeaderComponent> = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'iphonex',
    }
  },
};

