import { Meta, StoryObj } from '@storybook/angular';
import { TopNavComponent } from './top-nav.component';

const meta: Meta<TopNavComponent> = {
  title: 'Components/TopNav',
  component: TopNavComponent,
};

export default meta;
type Story = StoryObj<TopNavComponent>;

export const DesktopBig: Story = {
};

export const MobileBig: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone13',
    },
  }
};
