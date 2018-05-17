import React from "react";
import { render } from "react-dom";
import { injectGlobal } from "react-emotion";
import { compose, withState, lifecycle, withProps } from "recompose";
import _throttle from "lodash/fp/throttle";
import App from "./App";

injectGlobal`
  html, body {
    margin: 0;
  }
`;

const API_KEY = window.config.API_KEY;
const THROTTLE_WAIT = 1000; // 1 second

const throttle = _throttle(THROTTLE_WAIT);

const enhance = compose(
  withState("groups", "setGroups", {}),
  withState("lights", "setLights", {}),
  // TODO: change these methods to hook the Hue Emulator API calls
  // entity may be a light or a room, they have an extra `id` property
  // the second argument is the new value selected by the user
  withProps({
    onColorTemperatureChange: throttle((entity, temp) =>
      console.log(entity.id, temp)
    ),
    onColorChange: throttle((entity, color) => console.log(entity.id, color)),
    onBrightnessChange: throttle((entity, bri) => console.log(entity.id, bri)),
    onStateChange: throttle((entity, state) =>
      console.log(entity.id, entity.type, state)
    ),
    // this should trigger a state change on ALL the available lights
    onGlobalStateChange: throttle(state => console.log("all the lights", state))
  }),
  lifecycle({
    async componentDidMount() {
      const res = await Promise.all([
        fetch(`/api/${API_KEY}/groups`),
        fetch(`/api/${API_KEY}/lights`)
      ]);
      const json = await Promise.all([res[0].json(), res[1].json()]);

      this.props.setGroups(json[0]);
      this.props.setLights(json[1]);
    }
  })
);

const AppWithData = enhance(App);

render(<AppWithData />, document.getElementById("root"));