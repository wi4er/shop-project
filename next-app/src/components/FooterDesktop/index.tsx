import LogoSvg from '../../svg/LogoWhite.svg';
import Menu from '@/components/FooterDesktop/Menu';
import cn from 'classnames';
import css from './index.module.css';
import font from '../../style/text-style.module.css';

export default function FooterDesktop() {
  return (
    <div className={css.root}>
      <div className={css.box}>
        <div className={css.top}>
          <LogoSvg className={css.logo}/>

          <div className={cn(css.text, font.poppins_regular_16)}>
            Your natural candle made for your home and for your wellness.
          </div>
        </div>

        <div className={css.menu}>
          <Menu
            title={'Discovery'}
            list={[{
              name: 'New season',
              link: '/',
            }, {
              name: 'Most searched',
              link: '/',
            }, {
              name: 'Most selled',
              link: '/',
            }]}
          />

          <Menu
            title={'Info'}
            list={[{
              name: 'Contact us',
              link: '/',
            }, {
              name: 'Privacy Policies',
              link: '/',
            }, {
              name: 'Terms & Conditions',
              link: '/',
            }]}
          />

          <Menu
            title={'About'}
            list={[{
              name: 'Help',
              link: '/',
            }, {
              name: 'Shipping',
              link: '/',
            }, {
              name: 'Affiliate',
              link: '/',
            }]}
          />

        </div>
      </div>
    </div>
  );
}