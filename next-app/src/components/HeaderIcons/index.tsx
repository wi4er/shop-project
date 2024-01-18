import ProfileSvg from '../../svg/Profile.svg';
import CartSvg from '../../svg/Cart.svg';
import css from './index.module.css';

export default function HeaderIcons() {
  return (
    <div className={css.root}>
      <ProfileSvg className={css.profile} />

      <CartSvg className={css.cart} />
    </div>
  );
}