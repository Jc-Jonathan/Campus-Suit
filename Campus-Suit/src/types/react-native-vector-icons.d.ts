declare module 'react-native-vector-icons/Ionicons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';
  import { IconProps } from 'react-native-vector-icons/Icon';

  export interface IoniconsProps extends IconProps {
    name: string;
  }

  const Ionicons: ComponentType<IoniconsProps>;
  export default Ionicons;
}
