import { componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular';
import { SelectComponent } from './select.component';

const meta: Meta<SelectComponent> = {
  title: 'View/Select',
  component: SelectComponent,
  decorators: [
    componentWrapperDecorator(
      story => `<div style="display: flex; align-items: center; justify-content: center; height: 100vh">${story}</div>`
    )
  ],
};

const list = [{
  id: '1',
  name: 'Position 1111'
}, {
  id: '2',
  name: 'Position 2222'
},{
  id: '3',
  name: 'Position 3333'
},{
  id: '4',
  name: 'Position 4444'
},{
  id: '5',
  name: 'Position 5555'
},{
  id: '6',
  name: 'Position 6666'
}];

export default meta;

export const Closed: StoryObj<SelectComponent> = {
  args: {
    label: 'Label',
    list: list,
    current: '1'
  },
};
