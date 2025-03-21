import list from '../insight-list/mock/list';
import { BlogListComponent } from './blog-list.component';

export default {
  title: 'components/BlogList',
  component: BlogListComponent,
}

export const Appear = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop'
    },
  },
  args: {
    primary: true,
    item: list[0],
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
    item: list[0],
  }
}
