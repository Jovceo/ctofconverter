import RoomTemperaturePage, { RoomTemperaturePageTranslation } from '../components/RoomTemperaturePage';
import {
  createTemperaturePageStaticProps,
  LocalizedTemperaturePageProps,
} from '../utils/temperaturePageStaticProps';

export const getStaticProps = createTemperaturePageStaticProps<RoomTemperaturePageTranslation>('33-c-to-f');

export default function Temperature33C(props: LocalizedTemperaturePageProps<RoomTemperaturePageTranslation>) {
  return <RoomTemperaturePage celsius={33} {...props} />;
}
