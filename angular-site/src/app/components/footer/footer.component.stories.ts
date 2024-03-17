import { Meta, StoryObj } from '@storybook/angular';
import { FooterComponent } from './footer.component';

const meta: Meta<FooterComponent> = {
  title: 'Components/Footer',
  component: FooterComponent,
};

export default meta;
type Story = StoryObj<FooterComponent>;

export const DesktopSmall: Story = {
  args: {
  },
};

export const MobileSmall: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone13',
    },
  }
};
