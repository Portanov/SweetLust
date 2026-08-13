import { Component } from '@angular/core';
import {
  CoordinateComponent,
  DefaultControlComponent,
  DefaultInteractionComponent,
  FeatureComponent,
  GeometryPointComponent,
  LayerTileComponent,
  LayerVectorComponent,
  MapComponent,
  SourceOsmComponent,
  SourceVectorComponent,
  StyleCircleComponent,
  StyleComponent,
  StyleFillComponent,
  StyleStrokeComponent,
  StyleTextComponent,
  ViewComponent,
} from 'ng-openlayers';


@Component({
  selector: 'app-map',
  imports: [
    MapComponent,
    ViewComponent,
    CoordinateComponent,
    LayerTileComponent,
    LayerVectorComponent,
    SourceOsmComponent,
    SourceVectorComponent,
    FeatureComponent,
    GeometryPointComponent,
    StyleComponent,
    StyleCircleComponent,
    StyleFillComponent,
    StyleStrokeComponent,
    StyleTextComponent,
    DefaultInteractionComponent,
    DefaultControlComponent,
  ],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map {
}
