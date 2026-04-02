import RoomTemperaturePage, { RoomTemperaturePageTranslation } from '../components/RoomTemperaturePage';
import {
  createTemperaturePageStaticProps,
  LocalizedTemperaturePageProps,
} from '../utils/temperaturePageStaticProps';

export const getStaticProps = createTemperaturePageStaticProps<RoomTemperaturePageTranslation>('35-c-to-f');

export default function Temperature35C(props: LocalizedTemperaturePageProps<RoomTemperaturePageTranslation>) {
  return <RoomTemperaturePage celsius={35} {...props} />;
}
