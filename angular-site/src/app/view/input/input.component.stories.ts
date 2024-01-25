import { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input.component';

const meta: Meta<InputComponent> = {
  title: 'View/Input',
  component: InputComponent,
  tags: ['autodocs'],
};

export default meta;

export const Small: StoryObj<InputComponent> = {
  args: {
    placeholder: 'Placeholder'
  },
};
