import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

print("EDA Sample Test Script")

df = pd.read_csv('../../sample_data/products.csv')
print(f"Data loaded: {df.shape}")

print("\nColumn types:")
print(df.dtypes)

print("\nBasic statistics:")
print(df.describe())

print("\nMissing values:")
print(df.isnull().sum())

print("\nCategory distribution:")
print(df['Category'].value_counts())

print("\nScript executed successfully!")