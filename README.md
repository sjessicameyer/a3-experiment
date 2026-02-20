# Assignment 3 - Map Visualization Experiment

**Team Members**: Sarah Meyer and Cole Goulding

## Experiment Link
[**> Click here to view the Live Experiment <**](https://sjessicameyer.github.io/a3-experiment/a3experiment/SEVFVUNGaWFCVEhiMU55ajRqczliUT09)

---

## Experiment Description
Instead of replicating the standard Cleveland and McGill experiment, our team chose to investigate the perceptual effectiveness of different thematic map types.

We designed a controlled user study to compare four different geographical visualization techniques:
1. **Bubble Map**
2. **Choropleth Map**
3. **Spike Map**
4. **Hexbin Map**

### The Task
Participants were presented with a map visualization and asked to estimate the population of a specific region or city. We collected 20 trials per participant (5 per map type) to ensure robust data. Trial order was randomized and the even the map shape and data itself was fully randomized. Since hex bin maps are typically multivariate, both size and colors in this case correlated with population. 

### Hypothesis
We hypothesized that cloropleth maps would yield lower estimation errors, followed by bubble maps, spike maps, and finally hex bin maps. 

### Data Collection
We asked n = 19 friends, family, and classmates to fill out this survey, which we hosted on Github. Participants were asked to use a laptop or desktop computer for the experiment. Participants were allowed to contact us for more clarification. No identifiable information was collected during the experiment.

---

## Visualizations

| Bubble Map | Choropleth Map |
| :---: | :---: |
| ![Bubble Map](img/bubble.png) | ![Choropleth Map](img/choro.png) |
| **Spike Map** | **Hexbin Map** |
| ![Spike Map](img/spike.png) | ![Hexbin Map](img/hexbin.png) |

*(Note: Screenshots of the actual experiment interface)*

---
### Data validation
Data was filtered and validated on three criteria:
- A user must fill out all survey questions for their responses to be used
- Error must be reported as a multiple of 5 per survey instructions
- Error cannot be reported as a negative number

### Analysis & Results
We analyzed the results based on two primary metrics:

1. **Absolute Error**: The magnitude of deviation from the actual value.
2. **Bias**: The directional difference indicating tendencies to over- or under-estimate.

### Key Findings
* **Best Performer**: **[Insert Map Type]** had the lowest mean absolute error.
* **Bias Trends**: [TODO]
* **Statistical Significance**: [TODO].

![Error Histogram](data_analysis/errror_histogram.png)
![Error Plot](data_analysis/absolute_error_plot.png)
![Bias Plot](data_analysis/bias_plot.png)

---

## Technical Achievements
- **Custom Map Implementation**: Implemented four distinct D3.js map visualizations using TopoJSON and specific projection scaling.
- **Data Pipeline**: Created a robust analysis pipeline in Python (`analysis.py`) that merges user responses with ground truth data, performs cleaning, and runs statistical tests (ANOVA, Tukey HSD).
- **Automated Visualization**: The analysis script automatically generates error bars and bias distribution plots using `plotnine`.

## Design Achievements
- **Clean UI**: Designed a distraction-free experiment interface to focus participant attention on the map tasks.
- **Color & Scale**: Carefully selected color scales (e.g., ColorBrewer schemes) to ensure accessibility and clarity across map types.

---

## References
* [Insert Paper or Library Link 1]
* [Insert Paper or Library Link 2]