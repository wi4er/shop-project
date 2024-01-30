import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { InputComponent } from '../../view/input/input.component';
import { ButtonComponent } from '../../view/button/button.component';
import { RegFormComponent } from './reg-form.component';
import { CheckboxComponent } from '../../view/checkbox/checkbox.component';
import { SelectComponent } from '../../view/select/select.component';

const meta: Meta<RegFormComponent> = {
  title: 'Component/RegForm',
  component: RegFormComponent,

  decorators: [
    moduleMetadata({
      declarations: [InputComponent, ButtonComponent, CheckboxComponent, SelectComponent],
    }),
    componentWrapperDecorator(
      story => `<div style="display: flex; align-items: center; justify-content: center; height: 100vh">${story}</div>`
    )
  ],
};

export default meta;

export const Desktop: StoryObj<RegFormComponent> = {
  args: {},
};
