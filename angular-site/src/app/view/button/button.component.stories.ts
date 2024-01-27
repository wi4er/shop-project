import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';
// @ts-ignore
import imageUrl from '../../../assets/Button.png';


const meta: Meta<ButtonComponent> = {
  title: 'View/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
};

export default meta;


export const Small: StoryObj<ButtonComponent> = {
  args: {},
  render: args => {
    return {
      template: `
      <div style="display: flex; flex-direction: column; gap: 14px">
        <app-button>
          Button
        </app-button>

        <app-button disabled="true">
          Button
        </app-button>
      </div>
      `,
    };
  },
};
