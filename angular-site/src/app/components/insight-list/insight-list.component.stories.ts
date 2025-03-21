import { InsightListComponent } from './insight-list.component';

export default {
  title: 'components/InsightList',
  component: InsightListComponent,
}

export const Appear = {
  parameters: {
    viewport: {
      // defaultViewport: 'desktop'
    },
    layout: 'centered',
  },
  args: {
    primary: true,
  }
}

export const Mobile = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone13'
    },
  },
  args: {
    primary: true,
  }
}
