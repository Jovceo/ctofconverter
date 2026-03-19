import RoomTemperaturePage, { RoomTemperaturePageTranslation } from '../components/RoomTemperaturePage';
import {
  createTemperaturePageStaticProps,
  LocalizedTemperaturePageProps,
} from '../utils/temperaturePageStaticProps';

export const getStaticProps = createTemperaturePageStaticProps<RoomTemperaturePageTranslation>('29-c-to-f');

export default function Temperature29C(props: LocalizedTemperaturePageProps<RoomTemperaturePageTranslation>) {
  return <RoomTemperaturePage celsius={29} {...props} />;
}
