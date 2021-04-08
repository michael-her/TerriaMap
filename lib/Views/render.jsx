import ReactDOM from "react-dom";
import RedBox from "redbox-react";
import React from "react";

import { Provider } from "react-redux";
import { browserHistory, Router, Route } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import store from "./store";

const history = syncHistoryWithStore(browserHistory, store);

// const appRoute = buildAppRoutes(App);

const terriaGetState = state => state.app.keplerGl;

export default function renderUi(terria, allBaseMaps, viewState) {
  let render = () => {
    const UI = require("./UserInterface").default;
    // michael
    const Root = () => (
      <Provider store={store}>
        <UI
          terria={terria}
          getState={terriaGetState}
          allBaseMaps={allBaseMaps}
          viewState={viewState}
        />
      </Provider>
    );
    // const Root = () => (
    //   <Provider store={store}>
    //     <Router history={history}>
    //       <Route path="/">
    //         <UI terria={terria} allBaseMaps={allBaseMaps} viewState={viewState} />
    //       </Route>
    //     </Router>
    //   </Provider>
    // );
    ReactDOM.render(<Root />, document.getElementById("ui"));
  };

  if (module.hot && process.env.NODE_ENV !== "production") {
    // Support hot reloading of components
    // and display an overlay for runtime errors
    const renderApp = render;
    const renderError = error => {
      console.error(error);
      console.error(error.stack);
      ReactDOM.render(<RedBox error={error} />, document.getElementById("ui"));
    };
    render = () => {
      try {
        renderApp();
      } catch (error) {
        renderError(error);
      }
    };
    module.hot.accept("./UserInterface", () => {
      setTimeout(render);
    });
  }

  render();
}
