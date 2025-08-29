<!-- This README file is going to be the one displayed on the Grafana.com website for your plugin. Uncomment and replace the content here before publishing.

Remove any remaining comments before publishing as these may be displayed on Grafana.com -->

# Universal Robots URDF Viewer

## Overview

The Universal Robots URDF Viewer panel renders a UR e-series arm (UR16e/UR10e) inside Grafana using a URDF model and animates the joints from live time-series data. It’s designed as a lightweight digital twin for dashboards: operators can orbit, pan, and zoom the 3D scene and watch joint motion in real time.

**Examples**

UR16e:
![UR16 Panel](https://raw.githubusercontent.com/ijsaleem/ur16e-panel/refs/heads/main/src/img/screenshots/UR16%20panel.png)

UR10:
![UR10 Panel](https://raw.githubusercontent.com/ijsaleem/ur16e-panel/refs/heads/main/src/img/screenshots/UR10%20panel.png)


## Key features:

- URDF model loading with Three.js rendering (grid, ambient + directional lights, OrbitControls).

- Fixed field→joint mapping for fast, repeatable wiring from a Grafana data frame.

- Model switch option (ur16e / ur10e).

- Radians-based inputs by default (degree data can be converted upstream or scaled).

## Requirements
This panel uses three.js and URDF-Loader and assumes a data source of real time data coming from a Universal Robot (URSim or physical robot) via RTDE  

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
  
## Further Development:
To continue development in a linux distro of your choice:
- Clone this repo
- run  `npm install`
- also run `docker compose up`
- navigate to http://localhost:3000

To add additional robots:
- Add URDFs and meshes to revelvent forlders within `/img/`
- Create options to click within `src/module.ts`



## Contributing
Find any problems or want to suggest any changes? Email me at [ijaz@saleem.live](mailto:ijaz@saleem.live)
