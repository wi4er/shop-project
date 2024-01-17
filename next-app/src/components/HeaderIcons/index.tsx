import ProfileSvg from '../../svg/Profile.svg';
import CartSvg from '../../svg/Cart.svg';
import css from './index.module.css';

export default function HeaderIcons() {
  return (
    <div className={css.root}>
      <ProfileSvg
        className={css.ico}
        width="34"
        height="34"
      />

      <CartSvg
        width="26"
        height="26"
      />
    </div>
  );
}