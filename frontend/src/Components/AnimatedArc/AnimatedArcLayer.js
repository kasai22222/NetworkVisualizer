import { ArcLayer } from '@deck.gl/layers';
import { tripsUniforms } from './trips-uniforms';

export class AnimatedArcLayer extends ArcLayer {
  static layerName = 'AnimatedArcLayer';
  static defaultProps = {
    ...ArcLayer.defaultProps,
    getSourceTimestamp: { type: 'accessor', value: 0 },
    getTargetTimestamp: { type: 'accessor', value: 1 },
    timeRange: { type: 'array', compare: true, value: [0, 1] }
  };

  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      'vs:#decl': `
in float instanceSourceTimestamp;
in float instanceTargetTimestamp;
out float vTimestamp;
`,
      'vs:#main-end': `
vTimestamp = mix(instanceSourceTimestamp, instanceTargetTimestamp, segmentRatio);
`,
      'fs:#decl': `
in float vTimestamp;
`,
      'fs:#main-start': `
if (vTimestamp < trips.timeRange.x || vTimestamp > trips.timeRange.y) {
    discard;
}
`,
      'fs:DECKGL_FILTER_COLOR': `
color.a *= (vTimestamp - trips.timeRange.x) / (trips.timeRange.y - trips.timeRange.x);
`
    };
    shaders.modules = [...shaders.modules, tripsUniforms];
    return shaders;
  }

  initializeState() {
    super.initializeState();
    this.getAttributeManager().addInstanced({
      instanceSourceTimestamp: {
        size: 1,
        accessor: 'getSourceTimestamp'
      },
      instanceTargetTimestamp: {
        size: 1,
        accessor: 'getTargetTimestamp'
      }
    });
  }

  draw(params) {
    super.draw(params);
    const { data, timeRange, getSourceTimestamp, getTargetTimestamp } = this.props;
    if (timeRange && data && data.length > 0) {
      console.log("AnimatedArcLayer: timeRange =", timeRange);
      const time1 = getSourceTimestamp(data[0]);
      const time2 = getTargetTimestamp(data[0]);
      console.log("  First time1:", time1);
      console.log("  First time2:", time2);
      //  CRITICAL: Check if timestamps are within timeRange
      const withinRange = time1 >= timeRange[0] && time2 <= timeRange[1];
      console.log("  Are timestamps within timeRange?", withinRange);
    }
  }
}
