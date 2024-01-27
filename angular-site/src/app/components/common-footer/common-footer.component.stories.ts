import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../../view/button/button.component';
import { CommonFooterComponent } from './common-footer.component';

const meta: Meta<ButtonComponent> = {
  title: 'Component/CommonFooter',
  component: CommonFooterComponent,
};

export default meta;

export const Desktop: StoryObj<CommonFooterComponent> = {
  args: {},
  render: args => {
    return {
      template: `
        <app-common-footer
        >
        </app-common-footer>
      `,
    };
  },
};

export const Mobile: StoryObj<CommonFooterComponent> = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'iphonex',
    }
  },
  render: args => {
    return {
      template: `
        <app-common-footer
        >
        </app-common-footer>
      `,
    };
  },
};
