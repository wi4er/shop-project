import list from '../insight-list/mock/list';
import { BlogItemComponent } from './blog-item.component';

export default {
  title: 'components/BlogItem',
  component: BlogItemComponent,
}

export const Appear = {
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
  },
  args: {
    primary: true,
    item: list[0],
  }
}
