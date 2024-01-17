import css from './index.module.css';
import LogoSvg from '../../svg/Logo.svg';
import ArrowSvg from '../../svg/ChevronDown.svg';
import { Menu } from '@/components/NavigationDesktop/Menu';
import HeaderIcons from '@/components/HeaderIcons';
import Link from 'next/link';

export default function NavigationDesktop() {
  console.log(LogoSvg);

  return (
    <div className={css.root}>
      <Link
        className={css.left}
        href={'/'}
      >
        <LogoSvg
          width="125"
          height="34"
        />
      </Link>

      <Menu list={[{
        name: 'Discovery',
        link: '/',
        icon: <ArrowSvg/>,
      }, {
        name: 'About',
        link: '/',
      }, {
        name: 'Contact us',
        link: '/',
      }]}/>

      <div className={css.right}>
        <HeaderIcons/>
      </div>
    </div>
  );
}