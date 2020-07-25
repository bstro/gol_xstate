import React from "react";
import styled from "styled-components";
import { useRect } from "@reach/rect";
import { useWindowSize } from "@reach/window-size";

import { Board } from "./Board";

const AppContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

function App() {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerRect = useRect(containerRef);

  return (
    <AppContainer ref={containerRef}>
      {containerRect ? <Board containerRect={containerRect} /> : <></>}
    </AppContainer>
  );
}

export default App;
