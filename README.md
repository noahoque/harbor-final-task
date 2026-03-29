# Pelago Bicycles – Dynamic Range Visualizer

**Live Prototype:** [https://noahoque.github.io/harbor-final-task/]

A web app that shows how far you can ride a Pelago e-bike based on
your current temperature and body weight.

## How the range is calculated

The app takes each bike's official rated range and applies two adjustments.

### Temperature

Based on Geotab's real-world EV range study (geotab.com/blog/ev-range),
which analyzed millions of trips across different climates:

| Temperature     | Multiplier |
|-----------------|------------|
| 15°C and above  | 100%       |
| 5°C to 15°C     | 90%        |
| 0°C to 5°C      | 80%        |
| −10°C to 0°C    | 70%        |
| −20°C to −10°C  | 50%        |
| Below −20°C     | 40%        |

### Rider weight

We use 75 kg as a baseline. For every kg above that, 0.5 km is 
subtracted from the range. For every kg below, 0.5 km is added.
```
range = range - (kg - 75) * 0.5
```
