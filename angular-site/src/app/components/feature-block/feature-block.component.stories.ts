import { Meta, StoryObj } from '@storybook/angular';
import { TopNavComponent } from '../top-nav/top-nav.component';
import { FeatureBlockComponent } from './feature-block.component';

const meta: Meta<FeatureBlockComponent> = {
  title: 'Components/FeatureBlock',
  component: FeatureBlockComponent,
};

export default meta;
type Story = StoryObj<FeatureBlockComponent>;

export const DesktopBig: Story = {
};

export const MobileBig: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone13',
    },
  }
};
