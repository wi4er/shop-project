import { Meta, StoryObj } from '@storybook/angular';
import { CommonFooterComponent } from './common-footer.component';

const meta: Meta<CommonFooterComponent> = {
  title: 'Component/CommonFooter',
  component: CommonFooterComponent,
};

export default meta;

export const Desktop: StoryObj<CommonFooterComponent> = {
  args: {},
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
