
interface MenuPropsItem {
  name: string;
  link: string;
}

export interface MenuProps {
  list: MenuPropsItem[];
  title: string;
}