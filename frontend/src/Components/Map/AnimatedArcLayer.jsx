// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import { ArcLayer } from '@deck.gl/layers';

const uniformBlock = `\
uniform arcsUniforms {
  vec2 timeRange;
} arcs;
`;


export const arcsUniforms = {
  name: 'arcs',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    timeRange: 'vec2<f32>'
  }
};

const defaultProps = {
  getSourceTimestamp: { type: 'accessor', value: 0 },
  getTargetTimestamp: { type: 'accessor', value: 1 },
  timeRange: { type: 'array', compare: true, value: [0, 1] }
};

export default class AnimatedArcLayer extends ArcLayer {
  layerName = 'AnimatedArcLayer';
  defaultProps = defaultProps;

  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      'vs:#decl': `\
in float instanceSourceTimestamp;
in float instanceTargetTimestamp;
out float vTimestamp;
`,
      'vs:#main-end': `\
vTimestamp = mix(instanceSourceTimestamp, instanceTargetTimestamp, segmentRatio);
`,
      'fs:#decl': `\
in float vTimestamp;
`,
      'fs:#main-start': `\
if (vTimestamp < arcs.timeRange.x || vTimestamp > arcs.timeRange.y) {
  discard;
}
`,
      'fs:DECKGL_FILTER_COLOR': `\
color.a *= (vTimestamp - arcs.timeRange.x) / (arcs.timeRange.y - arcs.timeRange.x);
`
    };
    shaders.modules = [...shaders.modules, arcsUniforms];
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
    const { timeRange } = this.props;
    const arcsProps = { timeRange };
    const model = this.state.model;
    model.shaderInputs.setProps({ arcs: arcsProps });
    super.draw(params);
  }
}
