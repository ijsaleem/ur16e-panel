import { PanelPlugin } from '@grafana/data';
import { UrdfPanel } from './components/UrdfPanel';
import type { PanelOptions } from './types';

export const plugin = new PanelPlugin<PanelOptions>(UrdfPanel).setPanelOptions((builder) =>
  builder.addRadio({
    path: 'model',
    name: 'Robot model',
    defaultValue: 'ur16e',
    settings: {
      options: [
        { value: 'ur16e', label: 'UR16e' },
        { value: 'ur10e', label: 'UR10e' },
      ],
    },
  })
);
