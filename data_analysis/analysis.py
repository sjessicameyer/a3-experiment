import pandas as pd
import numpy as np
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import ols
from statsmodels.stats.multicomp import pairwise_tukeyhsd
from plotnine import (ggplot, aes, geom_bar, geom_errorbar, geom_hline, geom_vline, geom_histogram,
                      labs, theme_minimal, facet_wrap, theme, element_text)

def run_experiment_analysis(file_path):
    # Load data
    df = pd.read_csv(file_path)
    
    # Extract and merge user responses with ground truth
    resp_ids = ['bubble-response', 'choropleth-response', 'spike-response', 'hexbin-response']
    responses = df[df['responseId'].isin(resp_ids)].copy()
    ground_truths = df[df['responseId'] == 'groundTruth'].copy()
    
    data = pd.merge(
        responses, 
        ground_truths[['participantId', 'trialId', 'trialOrder', 'answer']], 
        on=['participantId', 'trialId', 'trialOrder'],
        suffixes=('_user', '_truth')
    )
    
    # Numeric conversion
    data['user_answer'] = pd.to_numeric(data['answer_user'], errors='coerce')
    data['correct_answer'] = pd.to_numeric(data['answer_truth'], errors='coerce')
    data = data.dropna(subset=['user_answer', 'correct_answer'])

    # --------- QC ----------#
    # full set of 20 clean trials
    trial_counts = data.groupby('participantId')['trialOrder'].nunique()
    completed_users = trial_counts[trial_counts == 20].index
    data = data[data['participantId'].isin(completed_users)].copy()

    # non-negative and multiples of 5
    data = data[(data['user_answer'] >= 0) & (data['user_answer'] % 5 == 0)].copy()

    # ------- Statistics --------- #
    # dummy variables
    data['abs_error'] = (data['user_answer'] - data['correct_answer']).abs()
    data['bias'] = data['user_answer'] - data['correct_answer'] 
    
    #Aggregate summary statistics
    summary_list = []
    for mtype in data['parameters_mapType'].unique():
        subset = data[data['parameters_mapType'] == mtype]
        row = {'MapType': mtype}
        for metric in ['abs_error', 'bias']:
            vals = subset[metric].dropna()
            mean = np.mean(vals)
            sem = stats.sem(vals)
            ci = sem * stats.t.ppf((1 + 0.95) / 2., len(vals) - 1)
            row[f'{metric}_mean'] = round(mean, 2)
            row[f'{metric}_ci95'] = round(ci, 2)
        row['count'] = len(subset)
        summary_list.append(row)
    
    summary_df = pd.DataFrame(summary_list).set_index('MapType')
    
    # ANOVA
    model = ols('abs_error ~ C(parameters_mapType)', data=data).fit()
    anova_table = sm.stats.anova_lm(model, typ=2)

    # ANOVA on Bias
    model_bias = ols('bias ~ C(parameters_mapType)', data=data).fit()
    anova_bias = sm.stats.anova_lm(model_bias, typ=2)

    # Tukey HSD
    tukey = pairwise_tukeyhsd(endog=data['abs_error'], 
                            groups=data['parameters_mapType'], 
                            alpha=0.05)
    #Tukey on bias
    tukey_bias = pairwise_tukeyhsd(endog=data['bias'], 
                               groups=data['parameters_mapType'], 
                               alpha=0.05)
    
    return data, summary_df, anova_table, tukey, anova_bias, tukey_bias

def export_visualizations(summary_df, data):
    plot_data = summary_df.reset_index()

    error_plot = (
        ggplot(plot_data, aes(x='MapType', y='abs_error_mean', fill='MapType'))
        + geom_bar(stat='identity', show_legend=False)
        + geom_errorbar(
            aes(ymin='abs_error_mean - abs_error_ci95', 
                ymax='abs_error_mean + abs_error_ci95'), 
            width=0.2
        )
        + labs(title='Mean Absolute Error by Map Type',
               subtitle='Error bars represent 95% Confidence Intervals',
               y='Absolute Error', x='')
        + theme_minimal()
        + theme(axis_text_x=element_text(rotation=45, hjust=1))
    )
    
    bias_plot = (
        ggplot(plot_data, aes(x='MapType', y='bias_mean', fill='MapType'))
        + geom_bar(stat='identity', show_legend=False)
        + geom_errorbar(
            aes(ymin='bias_mean - bias_ci95', 
                ymax='bias_mean + bias_ci95'), 
            width=0.2
        )
        + geom_hline(yintercept=0, linetype='dashed', color='red', size=1)
        + labs(title='Mean Bias by Map Type',
               subtitle='Positive = Overestimation | Negative = Underestimation',
               y='Bias (User - Truth)', x='')
        + theme_minimal()
        + theme(axis_text_x=element_text(rotation=45, hjust=1))
    )

    hist_plot = (
        ggplot(data, aes(x='bias', fill='parameters_mapType'))
        + geom_histogram(binwidth=5, color="black", alpha=0.7, show_legend=False)
        + geom_vline(xintercept=0, linetype="dashed", color="red", size=1)
        + facet_wrap('~parameters_mapType')
        + labs(title='Error Distribution by Map Type',
               x='Error (User - Truth)', y='Count')
        + theme_minimal()
    )

    error_plot.save("absolute_error_plot.png", width=8, height=6, dpi=300)
    bias_plot.save("bias_plot.png", width=8, height=6, dpi=300)
    hist_plot.save("error_histogram.png", width=10, height=6, dpi=300)
    
    print("Graphs exported successfully.")

# Run it
data, summary, anova, tukey, anova_bias, tukey_bias= run_experiment_analysis('a3experiment_all_tidy.csv')
print("--- Summary Statistics ---")
print(summary)
print("\n--- ANOVA Results ---")
print(anova)
print("\n--- Tukey HSD Post-hoc Test ---")
print(tukey)

print("\n--- ANOVA Results (Bias) ---")
print(anova_bias)

print("\n--- Tukey HSD (Bias) ---")
print(tukey_bias)

export_visualizations(summary, data)