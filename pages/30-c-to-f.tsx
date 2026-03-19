import RoomTemperaturePage, { RoomTemperaturePageTranslation } from '../components/RoomTemperaturePage';
import {
  createTemperaturePageStaticProps,
  LocalizedTemperaturePageProps,
} from '../utils/temperaturePageStaticProps';

export const getStaticProps = createTemperaturePageStaticProps<RoomTemperaturePageTranslation>('30-c-to-f');

export default function Temperature30C(props: LocalizedTemperaturePageProps<RoomTemperaturePageTranslation>) {
  return <RoomTemperaturePage celsius={30} {...props} />;
}
