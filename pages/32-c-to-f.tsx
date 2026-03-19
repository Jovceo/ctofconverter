import RoomTemperaturePage, { RoomTemperaturePageTranslation } from '../components/RoomTemperaturePage';
import {
  createTemperaturePageStaticProps,
  LocalizedTemperaturePageProps,
} from '../utils/temperaturePageStaticProps';

export const getStaticProps = createTemperaturePageStaticProps<RoomTemperaturePageTranslation>('32-c-to-f');

export default function Temperature32C(props: LocalizedTemperaturePageProps<RoomTemperaturePageTranslation>) {
  return <RoomTemperaturePage celsius={32} {...props} />;
}
