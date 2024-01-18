import css from './Menu.module.css';
import { MenuProps } from '@/components/NavigationDesktop/Menu.props';
import cn from 'classnames';
import font from '../../style/text-style.module.css';

export function Menu(props: MenuProps) {
  return (
    <div className={css.root}>
      {props.list.map(item => (
        <div
          key={item.name}
          className={css.item}
        >
          <div className={cn(css.name, font.poppins_medium_16)}>
            {item.name}
          </div>

          {item.icon ?? <div> {item.icon} </div>}
        </div>
      ))}
    </div>
  );
}