import css from './Menu.module.css';
import { MenuProps } from '@/components/FooterDesktop/Menu.props';
import font from '../../style/text-style.module.css';
import cn from 'classnames';

export default function Menu(props: MenuProps) {
  return (
    <div className={css.root}>
      <div className={cn(css.title, font.poppins_medium_16)}>
        {props.title}
      </div>

      <div className={css.list}>
        {props.list.map(item => (
          <div
            className={cn(css.item, font.poppins_medium_16)}
            key={item.name}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}