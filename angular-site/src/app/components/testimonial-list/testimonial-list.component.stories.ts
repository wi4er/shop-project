import { TestimonialListComponent } from './testimonial-list.component';

export default {
  title: 'components/TestimonialList',
  component: TestimonialListComponent,
}

export const Appear = {
  parameters: {
    viewport: {
      // defaultViewport: 'desktop'
    },
  },
  args: {
    primary: true,
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
  }
}
