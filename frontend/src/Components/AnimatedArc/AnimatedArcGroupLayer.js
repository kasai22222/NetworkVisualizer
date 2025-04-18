import { CompositeLayer } from '@deck.gl/core';
import { AnimatedArcLayer } from './AnimatedArcLayer';

const MAX_ARCS_PER_LAYER = 2500;

class AnimatedArcGroupLayer extends CompositeLayer {
  static layerName = 'AnimatedArcGroupLayer';
  static defaultProps = AnimatedArcLayer.defaultProps;

  updateState({ props, changeFlags }) {
    if (changeFlags.dataChanged) {
      const { data, getSourceTimestamp, getTargetTimestamp } = props;
      const groups = sortAndGroup(data, getSourceTimestamp, getTargetTimestamp);
      this.setState({ groups });
    }
  }

  renderLayers() {
    const { timeRange } = this.props;
    const { groups = [] } = this.state;

    if (groups.length === 0) {
      console.log("AnimatedArcGroupLayer: No data to render!");
    } else {
      console.log("AnimatedArcGroupLayer: Rendering", groups.length, "groups");
    }

    return groups.map(
      (group, index) =>
        new AnimatedArcLayer(
          this.props,
          this.getSubLayerProps({
            id: index.toString(),
            data: group.data,
            visible: group.startTime < timeRange[1] && group.endTime > timeRange[0],
            timeRange
          })
        )
    );
  }
}

function sortAndGroup(data, getStartTime, getEndTime, groupSize = MAX_ARCS_PER_LAYER) {
  const groups = [];
  let group;

  data.sort((d1, d2) => getStartTime(d1) - getStartTime(d2));

  for (const d of data) {
    if (!group || group.data.length >= groupSize) {
      group = {
        startTime: Infinity,
        endTime: -Infinity,
        data: []
      };
      groups.push(group);
    }
    group.data.push(d);
    group.startTime = Math.min(group.startTime, getStartTime(d));
    group.endTime = Math.max(group.endTime, getEndTime(d));
  }
  return groups;
}

export default AnimatedArcGroupLayer;
