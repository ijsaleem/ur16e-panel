<!-- This README file is going to be the one displayed on the Grafana.com website for your plugin. Uncomment and replace the content here before publishing.

Remove any remaining comments before publishing as these may be displayed on Grafana.com -->

# Universal Robots URDF Viewer

## Overview

The Universal Robots URDF Viewer panel renders a UR e-series arm (UR16e/UR10e) inside Grafana using a URDF model and animates the joints from live time-series data. It’s designed as a lightweight digital twin for dashboards: operators can orbit, pan, and zoom the 3D scene and watch joint motion in real time.

## Key features:

- URDF model loading with Three.js rendering (grid, ambient + directional lights, OrbitControls).

- Fixed field→joint mapping for fast, repeatable wiring from a Grafana data frame.

- Model switch option (ur16e / ur10e).

- Radians-based inputs by default (degree data can be converted upstream or scaled).



**BEFORE YOU BEGIN**
- Ensure all links are absolute URLs so that they will work when the README is displayed within Grafana and Grafana.com
- Be inspired ✨
  - [grafana-polystat-panel](https://github.com/grafana/grafana-polystat-panel)
  - [volkovlabs-variable-panel](https://github.com/volkovlabs/volkovlabs-variable-panel)

## Overview / Introduction
Provide one or more paragraphs as an introduction to your plugin to help users understand why they should use it.

Consider including screenshots:
- in [plugin.json](https://grafana.com/developers/plugin-tools/reference/plugin-json#info) include them as relative links.
- in the README ensure they are absolute URLs.

## Requirements
This panel uses three.js and assumes a data source of real time data coming from a Universal Robot (URSim or physical robot) via RTDE  

Data input is assumed to be `base, elbow, shoulder, wrist1, wrist2, wrist3` as seperate fields

## Getting Started
- Install panel
- Choose robot (UR16e or UR10)
- ### Query data
  Example query in flux (assumes bucket called "ur" and tag of "robot):  
  ```
  from(bucket: "ur")
    |> range(start: -15m)
    |> filter(fn: (r) => r._measurement == "joint" and r.metric == "actual_q")
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  ```
  



## Contributing
Find any problems or want to suggest any changes? Email me at [ijaz@saleem.live](mailto:ijaz@saleem.live)
