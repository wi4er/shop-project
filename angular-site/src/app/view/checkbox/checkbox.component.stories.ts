import { componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'View/Checkbox',
  component: CheckboxComponent,
  decorators: [
    componentWrapperDecorator(
      story => `<div style="display: flex; align-items: center; justify-content: center; height: 100vh">${story}</div>`
    )
  ],

};

export default meta;

export const Appear: StoryObj<CheckboxComponent> = {
  args: {},
  render: (args) => {
    return {
      template: `
        <div style="display: flex; flex-direction: column; gap: 40px">
          <app-checkbox
            text="Add me to Candleaf newsletter for a 10% discount"
          ></app-checkbox>
          <app-checkbox
            checked="true"
            text="Add me to Candleaf newsletter for a 10% discount"
          ></app-checkbox>
        </div>
      `
    };
  }
};
