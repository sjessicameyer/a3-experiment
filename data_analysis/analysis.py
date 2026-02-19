import pandas as pd
import numpy as np
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import ols
from statsmodels.stats.multicomp import pairwise_tukeyhsd

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
    
    return summary_df, anova_table, tukey, anova_bias, tukey_bias

# Run it
summary, anova, tukey, anova_bias, tukey_bias= run_experiment_analysis('a3experiment_all_tidy.csv')
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