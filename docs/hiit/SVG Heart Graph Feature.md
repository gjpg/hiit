## Benefit
The purpose of this feature is twofold:
1. To display and compare previous workout sessions to help the user assess their fitness
2. To display real time heart rates to help the user understand their effort and help them maintain a pace

## Acceptance Criteria
### Scaling
As I recall, Heartgraph autoscales both horizontally and vertically. It annoyed me that the warmup would be rendered in super spacious mode but because it rendered the entire plot, the interesting stuff was squished towards the end. I wanted to display the last few minutes (for the sake of argument, say 5 minutes). This could have improved the vertical resolution as well.

The time box looks dumb if it is taken from the earliest and latest sample times when there are a small number of point because as each point is added the graph stretches radically.

- Axes and labelling
- Gridlines + heart rate zones
- Time zones
- User Interaction
- Scrolling
- Multiple datasets and offsetting

