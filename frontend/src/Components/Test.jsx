import React from "react";
import DeckGL from "@deck.gl/react";
// import { MapViewState } from "@deck.gl/core";
import { LineLayer } from "@deck.gl/layers";

const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
};

export const Test = () => {
  const layers = [
    new LineLayer({
      id: "line-layer",
      data: "../../testData.json",
      getSourcePosition: (d) => d.from,
      getTargetPosition: (d) => d.to,
    }),
  ];

  return (
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller layers={layers} />
  );
};
