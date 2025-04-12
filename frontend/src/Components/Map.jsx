// var CartoDB_DarkMatterNoLabels = L.tileLayer(
//   "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
//   {
//     attribution:
//       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
//     subdomains: "abcd",
//     maxZoom: 20,
//   }

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";

const MyMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 20],
      zoom: 2,
      pitch: 30,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [
        new ScatterplotLayer({
          id: "scatter-layer",
          data: [
            {
              position: [-0.09, 51.505],
              size: 100,
              color: [255, 0, 0],
              name: "London",
            },
            {
              position: [-74.006, 40.7128],
              size: 100,
              color: [0, 255, 0],
              name: "NYC",
            },
            {
              position: [139.6503, 35.6762],
              size: 100,
              color: [0, 0, 255],
              name: "Tokyo",
            },
          ],
          getPosition: (d) => d.position,
          getFillColor: (d) => d.color,
          getRadius: (d) => d.size,
          pickable: true,
          onHover: ({ object, x, y }) => {
            const tooltip = document.getElementById("tooltip");
            if (object) {
              tooltip.style.display = "block";
              tooltip.style.left = `${x}px`;
              tooltip.style.top = `${y}px`;
              tooltip.innerHTML = object.name;
            } else {
              tooltip.style.display = "none";
            }
          },
        }),
      ],
    });

    map.addControl(overlay);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />
      <div
        id="tooltip"
        style={{
          position: "absolute",
          zIndex: 999,
          background: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          display: "none",
          pointerEvents: "none",
          fontSize: "12px",
          boxShadow: "0 1px 5px rgba(0,0,0,0.3)",
        }}
      />
    </>
  );
};

export default MyMap;
