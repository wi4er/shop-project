import { InsightItemComponent } from './insight-item.component';
import list from '../insight-list/mock/list';

export default {
  title: 'components/InsightItem',
  component: InsightItemComponent,
}

export const Appear = {
  parameters: {
    viewport: {
      // defaultViewport: 'desktop'
    },
    // layout: 'centered',
  },
  args: {
    primary: true,
    item: list[0],
  }
}

export const Mobile = {
  parameters: {
    viewport: {
      defaultViewport: 'iphonex'
    },
    // layout: 'centered',
  },
  args: {
    primary: true,
    item: list[0],
  }
}
