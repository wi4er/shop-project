
export interface Insight {

  id: string;
  image: string;
  title: string;
  text: string;
  date: Date;
  profile: {
    name: string;
    image: string;
  }
  more: string;

}
