import { TestimonialItemComponent } from './testimonial-item.component';


export default {
  title: 'components/TestimonialItem',
  component: TestimonialItemComponent,
};

const item = {
  id: '111a',
  name: 'Emily Rodriguez',
  position: 'Project Manager',
  image: '/assets/img/Image_1.png',
  text: 'Using this time tracking tool has been a game-changer for our team. The clear insights into task progress have significantly improved our efficiency and communication',
};

export const Appear = {
  args: {
    primary: true,
    item,
    // current: true,
  },
  parameters: {
    layout: 'centered',
  },
};

export const Mobile = {
  parameters: {
    viewport: {
      defaultViewport: 'iphonex',
    },
  },
  args: {
    primary: true,
    current: true,
    item,
  },
};
