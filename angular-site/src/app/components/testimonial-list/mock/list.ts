declare var require: any

import { Testimonial } from '../../../model/Testimonial';

export default [{
  id: '111a',
  name: 'Emily Rodriguez',
  position: 'Project Manager',
  image: '/assets/img/Image_1.png',
  text: 'Using this time tracking tool has been a game-changer for our team. The clear insights into task progress have significantly improved our efficiency and communication',
}, {
  id: '222a',
  name: 'David Johnson',
  position: 'Senior Developer',
  image: '/assets/img/Image_2.png',
  text: 'Effortlessly tracking time and managing tasks with this platform has streamlined our workflow. The detailed reports and ease of use have made a huge difference in meeting our deadlines',
}, {
  id: '333a',
  name: 'Sarah Lee',
  position: 'Operations Director',
  image: '/assets/img/Image_3.png',
  text: 'With this tool, we’ve gained invaluable feedback insights that have helped us optimize our processes. It’s an essential part of our strategy for boosting productivity and client satisfaction',
}] as Array<Testimonial>;

