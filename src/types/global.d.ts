declare module 'react-simple-maps' {
  import * as React from 'react';

  export interface ComposableMapProps {
    width?: number;
    height?: number;
    projection?: string | Function;
    projectionConfig?: any;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographiesProps {
    geography: string | object | any[];
    children: (data: { geographies: any[] }) => React.ReactNode;
  }

  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps {
    geography: any;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }

  export const Geography: React.FC<GeographyProps>;

  export interface MarkerProps {
    coordinates: [number, number];
    children?: React.ReactNode;
  }

  export const Marker: React.FC<MarkerProps>;

  export interface LineProps {
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    strokeOpacity?: number;
  }

  export const Line: React.FC<LineProps>;
}

declare module 'd3-scale' {
  export function scaleLinear(): any;
}
