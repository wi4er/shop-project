import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../../view/button/button.component';
import { CommonLayoutComponent } from './common-layout.component';

const meta: Meta<ButtonComponent> = {
  title: 'Component/CommonLayout',
  component: CommonLayoutComponent,
};

export default meta;

export const Small: StoryObj<ButtonComponent> = {
  args: {},
  render: args => {
    return {
      template: `
        <app-common-layout
        >
        </app-common-layout>
      `,
    };
  },
};
