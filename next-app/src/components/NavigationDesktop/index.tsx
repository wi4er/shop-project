import Link from 'next/link';
import css from './index.module.css';

export default function NavigationDesktop() {
  return (
    <div className={css.index}>
      <div>
        <Link href={'/'}>
          TO MAIN
        </Link>
      </div>

      DESKTOP HEADER HERE
    </div>
  );
}