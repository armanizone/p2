import { registerRootComponent } from 'expo';
import eventsource from "react-native-sse";

global.EventSource = eventsource;

import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
