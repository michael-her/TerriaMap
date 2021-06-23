import ReactDOM from "react-dom";
import RedBox from "redbox-react";
import React from "react";

import { Provider } from "react-redux";
import { browserHistory, Router, Route } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";

import styled, { ThemeProvider } from "styled-components";
import { theme } from "terriajs/lib/Styles";
import store from "./store";

const history = syncHistoryWithStore(browserHistory, store);

// const appRoute = buildAppRoutes(App);

const terriaGetState = state => state.app.keplerGl;

const GlobalStyle = styled.div`
  font-family: ff-clan-web-pro, "Helvetica Neue", Helvetica, sans-serif;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.71429;

  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: ${props => props.theme.labelColor};
  }
`;

export default function renderUi(terria, allBaseMaps, viewState) {
  // terria.store = store
  let render = () => {
    const UI = require("./UserInterface").default;
    // michael
    const Root = () => (
      <Provider store={terria.store}>
        <ThemeProvider theme={theme}>
          {/* <GlobalStyle
            // this is to apply the same modal style as kepler.gl core
            // because styled-components doesn't always return a node
            // https://github.com/styled-components/styled-components/issues/617
            ref={node => {
              node ? (this.root = node) : null;
            }}
          > */}
          <UI
            terria={terria}
            getState={terriaGetState}
            allBaseMaps={allBaseMaps}
            viewState={viewState}
          />
          {/* </GlobalStyle> */}
        </ThemeProvider>
      </Provider>
    );
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
