import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { AuthFormComponent } from './auth-form.component';
import { InputComponent } from '../../view/input/input.component';
import { ButtonComponent } from '../../view/button/button.component';
import { CommonFooterComponent } from '../common-footer/common-footer.component';

const meta: Meta<AuthFormComponent> = {
  title: 'Component/AuthForm',
  component: AuthFormComponent,

  decorators: [
    moduleMetadata({
      declarations: [InputComponent, ButtonComponent],
    }),
    componentWrapperDecorator(
      story => `<div style="display: flex; align-items: center; justify-content: center; height: 100vh">${story}</div>`
    )
  ],
};

export default meta;

export const Desktop: StoryObj<AuthFormComponent> = {
  args: {},
};


export const Mobile: StoryObj<AuthFormComponent> = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'iphonex',
    }
  },
};
