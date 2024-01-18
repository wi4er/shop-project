import BurgerSvg from '../../svg/hamburger-menu.svg';
import LogoSvg from '../../svg/Logo.svg';
import css from './index.module.css';
import HeaderIcons from '@/components/HeaderIcons';

export default function NavigationMobile() {
  return (
    <div className={css.root}>
      <div className={css.left}>
        <BurgerSvg />
      </div>

      <LogoSvg
        width={126}
        height={33}
      />

      <div className={css.right}>
        <HeaderIcons />
      </div>
    </div>
  );
}