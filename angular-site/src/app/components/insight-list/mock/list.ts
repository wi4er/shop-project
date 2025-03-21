import { Insight } from '../../../model/Insight';

export default [{
  id: '111',
  title: 'Data-Driven Decision Making: The Future of Project Management',
  text: 'Explore how leveraging data can transform the way you manage projects, leading to more informed decisions and better outcomes.',
  image: '/assets/img/Insight_1.png',
  date: new Date('2024-08-24'),
  profile: {
    name: 'Emily Rodriguez',
    image: '/assets/img/Profile_1.png',
  },
  more: '/'
}, {
  id: '222',
  title: 'The Role of Feedback Loops in Continuous Improvement',
  text: 'Delve into the importance of feedback loops in refining processes, enhancing performance, and driving ongoing success easily.',
  image: '/assets/img/Insight_2.png',
  date: new Date('2024-08-20'),
  profile: {
    name: 'David Johnson',
    image: '/assets/img/Profile_2.png',
  },
  more: '/'
}, {
  id: '333',
  title: 'Optimizing Resource Allocation for Maximum Efficiency',
  text: 'Learn advanced strategies for allocating resources effectively, ensuring that your projects run smoothly and meet their objectives.',
  image: '/assets/img/Insight_3.png',
  date: new Date('2024-08-14'),
  profile: {
    name: 'Sarah Lee',
    image: '/assets/img/Profile_3.png',
  },
  more: '/'
}] as Array<Insight>
