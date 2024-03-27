import { Element } from './Element';

export class MainFeature {

  public title: string = '';
  public text: string = '';
  public icon: string = '';

  constructor(item: Element) {
    for (const prop of item.property) {
      if (prop.property === 'NAME') this.title = prop.string;
      if (prop.property === 'TEXT') this.text = prop.string;
      if (prop.property === 'ICON') this.icon = prop.string;
    }
  }

}
